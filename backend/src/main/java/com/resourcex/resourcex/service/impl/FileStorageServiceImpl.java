package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.FileUploadResponse;
import com.resourcex.resourcex.entity.FileMetadata;
import com.resourcex.resourcex.entity.FilePurpose;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.repository.FileMetadataRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class FileStorageServiceImpl implements FileStorageService {

    /** Public path prefix the download endpoint serves from; also the {@code file_url} prefix. */
    private static final String URL_PREFIX = "/api/files/";

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(
            "jpg", "png", "gif", "webp", "bmp"
    );

    private final Path storageRoot;
    private final FileMetadataRepository fileMetadataRepository;
    private final UserRepository userRepository;

    public FileStorageServiceImpl(
            @Value("${storage.local-dir:uploads}") String localDir,
            FileMetadataRepository fileMetadataRepository,
            UserRepository userRepository
    ) {
        this.storageRoot = Paths.get(localDir).toAbsolutePath().normalize();
        this.fileMetadataRepository = fileMetadataRepository;
        this.userRepository = userRepository;
        try {
            Files.createDirectories(this.storageRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize storage directory: " + this.storageRoot, e);
        }
    }

    @Override
    @Transactional
    public FileUploadResponse storeFile(MultipartFile file, FilePurpose purpose, UserDetails userDetails) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds the maximum allowed size of " + (MAX_FILE_SIZE_BYTES / (1024 * 1024)) + " MB");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file", e);
        }

        // Never trust the client-declared Content-Type or original filename — both are
        // attacker-controlled (e.g. curl -F "file=@evil.php;type=image/jpeg" sails through a
        // header-only check). Sniff the real file format from its magic bytes and use that for
        // both validation and the stored extension.
        String detectedExtension = detectImageExtension(bytes);
        if (detectedExtension == null) {
            throw new IllegalArgumentException("Only image uploads are allowed (jpeg, png, gif, webp, bmp)");
        }

        String storedFileName = UUID.randomUUID() + "." + detectedExtension;
        Path targetLocation = resolveWithinStorage(storedFileName);

        try {
            Files.write(targetLocation, bytes, StandardOpenOption.CREATE_NEW);
        } catch (IOException e) {
            log.error("Failed to store upload {}", storedFileName, e);
            throw new RuntimeException("Failed to store file", e);
        }

        return persist(storedFileName, purpose, resolveUser(userDetails));
    }

    @Override
    @Transactional
    public FileUploadResponse storeBase64File(String base64Data, String fileName, FilePurpose purpose, UserDetails userDetails) {
        if (base64Data == null || base64Data.isBlank()) {
            throw new IllegalArgumentException("Base64 data is empty");
        }

        String rawBase64 = base64Data.contains(",")
                ? base64Data.substring(base64Data.indexOf(",") + 1)
                : base64Data;
        byte[] bytes = Base64.getDecoder().decode(rawBase64);

        String cleanName = StringUtils.cleanPath(fileName == null ? "" : fileName);
        if (bytes.length > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds the maximum allowed size of " + (MAX_FILE_SIZE_BYTES / (1024 * 1024)) + " MB");
        }
        // Sniff the real format from magic bytes rather than trusting the supplied filename's
        // extension — base64 uploads have no Content-Type header to spoof, but a malicious
        // extension on otherwise-arbitrary bytes was previously accepted as-is.
        String detectedExtension = detectImageExtension(bytes);
        if (detectedExtension == null) {
            throw new IllegalArgumentException("Only image uploads are allowed. Allowed: " + ALLOWED_IMAGE_EXTENSIONS);
        }

        String storedFileName = UUID.randomUUID() + "." + detectedExtension;
        Path targetLocation = resolveWithinStorage(storedFileName);

        try {
            Files.write(targetLocation, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store base64 file {}", cleanName, e);
            throw new RuntimeException("Failed to store base64 file", e);
        }

        return persist(storedFileName, purpose, resolveUser(userDetails));
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadAsResource(String fileName, UserDetails userDetails) {
        FileMetadata metadata = fileMetadataRepository.findByFileUrl(URL_PREFIX + fileName)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileName));

        if (!isPublicPurpose(metadata.getPurpose())) {
            if (userDetails == null) {
                throw new UnauthorizedException("Authentication required to access this file");
            }
            if (!isOwnerOrAdmin(metadata, userDetails)) {
                throw new UnauthorizedException("You do not have permission to access this file");
            }
        }

        try {
            Path file = resolveWithinStorage(fileName);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("Could not read file: " + fileName);
        } catch (ResourceNotFoundException | SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Could not load file: " + fileName, e);
        }
    }

    @Override
    @Transactional
    public void deleteFile(String fileName, UserDetails userDetails) {
        if (fileName == null || fileName.isBlank()) {
            return;
        }

        fileMetadataRepository.findByFileUrl(URL_PREFIX + fileName).ifPresent(metadata -> {
            if (userDetails == null) {
                throw new UnauthorizedException("Authentication required to delete file");
            }
            if (!isOwnerOrAdmin(metadata, userDetails)) {
                throw new UnauthorizedException("You do not have permission to delete this file");
            }

            try {
                Path file = resolveWithinStorage(fileName);
                Files.deleteIfExists(file);
                fileMetadataRepository.delete(metadata);
            } catch (Exception e) {
                log.warn("Failed to delete file from filesystem: {}", fileName, e);
            }
        });
    }

    // ── helpers ────────────────────────────────────────────────────────────

    /** Save the row referencing only the storage URL and build the response. */
    private FileUploadResponse persist(String storedFileName, FilePurpose purpose, User user) {
        FileMetadata metadata = FileMetadata.builder()
                .fileUrl(URL_PREFIX + storedFileName)
                .purpose(purpose)
                .user(user)
                .build();

        fileMetadataRepository.save(metadata);

        return FileUploadResponse.builder()
                .fileId(metadata.getFileId())
                .fileUrl(metadata.getFileUrl())
                .purpose(metadata.getPurpose())
                .uploaderId(user != null ? user.getUserId() : null)
                .itemId(metadata.getItem() != null ? metadata.getItem().getItemId() : null)
                .build();
    }

    /**
     * Identify the real image format from its magic bytes, ignoring any client-declared
     * Content-Type or filename extension (both are attacker-controlled). Returns the canonical
     * extension for a recognized, allowed format, or null if the bytes don't match any of them.
     */
    private String detectImageExtension(byte[] bytes) {
        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
                && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return "png";
        }
        if (bytes.length >= 6
                && bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8'
                && (bytes[4] == '7' || bytes[4] == '9') && bytes[5] == 'a') {
            return "gif";
        }
        if (bytes.length >= 2 && bytes[0] == 'B' && bytes[1] == 'M') {
            return "bmp";
        }
        if (bytes.length >= 12
                && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "webp";
        }
        return null;
    }

    private Path resolveWithinStorage(String fileName) {
        Path target = storageRoot.resolve(fileName).normalize();
        if (!target.startsWith(storageRoot)) {
            throw new SecurityException("Invalid file path: path traversal attempt detected");
        }
        return target;
    }

    private boolean isOwnerOrAdmin(FileMetadata metadata, UserDetails userDetails) {
        User owner = metadata.getUser();
        boolean isOwner = owner != null && owner.getEmail().equalsIgnoreCase(userDetails.getUsername());
        return isOwner || hasAdminRole(userDetails);
    }

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            return null; // Public upload if permitted by other layers (e.g. STUDENT_ID at registration)
        }
        return userRepository.findByEmailIgnoreCase(userDetails.getUsername()).orElse(null);
    }

    private boolean hasAdminRole(UserDetails userDetails) {
        if (userDetails == null) return false;
        for (GrantedAuthority authority : userDetails.getAuthorities()) {
            String role = authority.getAuthority();
            if ("ROLE_ADMIN".equals(role) || "ROLE_SUPER_ADMIN".equals(role)) {
                return true;
            }
        }
        return false;
    }

    /** Avatars and item images are public; student ID images are private. */
    private boolean isPublicPurpose(FilePurpose purpose) {
        return purpose == FilePurpose.ITEM_IMAGE || purpose == FilePurpose.AVATAR;
    }

}
