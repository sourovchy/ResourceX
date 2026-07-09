package com.resourcex.resourcex.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

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

@Service
@Slf4j
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "bmp"
    );
    
    private static final Set<String> ALLOWED_DOCUMENT_EXTENSIONS = Set.of(
            "pdf", "doc", "docx"
    );

    private final Path storageRoot;
    private final FileMetadataRepository fileMetadataRepository;
    private final UserRepository userRepository;

    public FileStorageServiceImpl(
            @Value("${app.storage.upload-dir:uploads}") String uploadDir,
            FileMetadataRepository fileMetadataRepository,
            UserRepository userRepository
    ) {
        this.storageRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
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

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        validateExtensionForPurpose(originalName, purpose);
        
        String extension = getExtension(originalName);
        String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path targetLocation = storageRoot.resolve(storedFileName).normalize();

        if (!targetLocation.startsWith(storageRoot)) {
            throw new SecurityException("Invalid file path: path traversal attempt detected");
        }

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store file {}", originalName, e);
            throw new RuntimeException("Failed to store file", e);
        }

        User uploader = resolveUser(userDetails);
        
        FileMetadata metadata = FileMetadata.builder()
                .originalName(originalName)
                .storedName(storedFileName)
                .fileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .fileSize(file.getSize())
                .purpose(purpose)
                .uploader(uploader)
                .build();
                
        fileMetadataRepository.save(metadata);

        return FileUploadResponse.builder()
                .fileId(metadata.getFileId())
                .originalName(originalName)
                .storedName(storedFileName)
                .fileUrl("/api/files/" + storedFileName)
                .fileType(metadata.getFileType())
                .fileSize(metadata.getFileSize())
                .purpose(purpose)
                .build();
    }

    @Override
    @Transactional
    public FileUploadResponse storeBase64File(String base64Data, String fileName, FilePurpose purpose, UserDetails userDetails) {
        if (base64Data == null || base64Data.isBlank()) {
            throw new IllegalArgumentException("Base64 data is empty");
        }

        String cleanName = StringUtils.cleanPath(fileName == null ? "" : fileName);
        validateExtensionForPurpose(cleanName, purpose);
        
        String extension = getExtension(cleanName);

        String rawBase64 = base64Data;
        if (base64Data.contains(",")) {
            rawBase64 = base64Data.substring(base64Data.indexOf(",") + 1);
        }

        byte[] bytes = Base64.getDecoder().decode(rawBase64);
        String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path targetLocation = storageRoot.resolve(storedFileName).normalize();

        if (!targetLocation.startsWith(storageRoot)) {
            throw new SecurityException("Invalid file path: path traversal attempt detected");
        }

        try {
            Files.write(targetLocation, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store base64 file {}", cleanName, e);
            throw new RuntimeException("Failed to store base64 file", e);
        }

        User uploader = resolveUser(userDetails);
        
        FileMetadata metadata = FileMetadata.builder()
                .originalName(cleanName)
                .storedName(storedFileName)
                .fileType(guessContentType(extension))
                .fileSize((long) bytes.length)
                .purpose(purpose)
                .uploader(uploader)
                .build();
                
        fileMetadataRepository.save(metadata);

        return FileUploadResponse.builder()
                .fileId(metadata.getFileId())
                .originalName(cleanName)
                .storedName(storedFileName)
                .fileUrl("/api/files/" + storedFileName)
                .fileType(metadata.getFileType())
                .fileSize(metadata.getFileSize())
                .purpose(purpose)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadAsResource(String storedName, UserDetails userDetails) {
        FileMetadata metadata = fileMetadataRepository.findByStoredName(storedName)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + storedName));

        // Security check
        if (!isPublicPurpose(metadata.getPurpose())) {
            if (userDetails == null) {
                throw new UnauthorizedException("Authentication required to access this file");
            }
            User uploader = metadata.getUploader();
            boolean isOwner = uploader != null && uploader.getEmail().equalsIgnoreCase(userDetails.getUsername());
            boolean isAdmin = hasAdminRole(userDetails);
            
            if (!isOwner && !isAdmin) {
                throw new UnauthorizedException("You do not have permission to access this file");
            }
        }

        try {
            Path file = storageRoot.resolve(storedName).normalize();
            if (!file.startsWith(storageRoot)) {
                throw new SecurityException("Invalid file path: path traversal attempt detected");
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read file: " + storedName);
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not load file: " + storedName, e);
        }
    }

    @Override
    @Transactional
    public void deleteFile(String storedName, UserDetails userDetails) {
        if (storedName == null || storedName.isBlank()) {
            return;
        }

        fileMetadataRepository.findByStoredName(storedName).ifPresent(metadata -> {
            if (userDetails == null) {
                throw new UnauthorizedException("Authentication required to delete file");
            }

            User uploader = metadata.getUploader();
            boolean isOwner = uploader != null && uploader.getEmail().equalsIgnoreCase(userDetails.getUsername());
            boolean isAdmin = hasAdminRole(userDetails);
            
            if (!isOwner && !isAdmin) {
                throw new UnauthorizedException("You do not have permission to delete this file");
            }

            try {
                Path file = storageRoot.resolve(storedName).normalize();
                if (!file.startsWith(storageRoot)) {
                    throw new SecurityException("Invalid file path: path traversal attempt detected");
                }
                Files.deleteIfExists(file);
                fileMetadataRepository.delete(metadata);
            } catch (Exception e) {
                log.warn("Failed to delete file from filesystem: {}", storedName, e);
            }
        });
    }

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            return null; // Public upload if permitted by other layers
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

    private boolean isPublicPurpose(FilePurpose purpose) {
        return purpose == FilePurpose.ITEM_IMAGE || purpose == FilePurpose.PROFILE_IMAGE;
    }

    private String getExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase();
    }
    
    private void validateExtensionForPurpose(String fileName, FilePurpose purpose) {
        String ext = getExtension(fileName);
        if (purpose == FilePurpose.ITEM_IMAGE || purpose == FilePurpose.PROFILE_IMAGE) {
            if (!ALLOWED_IMAGE_EXTENSIONS.contains(ext)) {
                throw new IllegalArgumentException("Invalid file extension for image. Allowed: " + ALLOWED_IMAGE_EXTENSIONS);
            }
        }
    }
    
    private String guessContentType(String extension) {
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "pdf" -> "application/pdf";
            default -> "application/octet-stream";
        };
    }
}
