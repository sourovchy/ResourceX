package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.FileUploadResponse;
import com.resourcex.resourcex.entity.FileMetadata;
import com.resourcex.resourcex.entity.FilePurpose;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.InternalServerException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.repository.FileMetadataRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.FileStorageService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private final FileMetadataRepository fileMetadataRepository;
    private final UserRepository userRepository;

    @Value("${app.storage.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    private static final List<String> IMAGE_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");
    private static final List<String> DOC_TYPES = Arrays.asList("application/pdf", "image/jpeg", "image/png");

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new InternalServerException("Could not create the directory where the uploaded files will be stored.");
        }
    }

    @Override
    public FileUploadResponse storeFile(MultipartFile file, FilePurpose purpose, UserDetails userDetails) {
        User uploader = null;
        if (userDetails != null) {
            uploader = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                    .orElseThrow(() -> new UnauthorizedException("User not found"));
        } else {
            if (purpose != FilePurpose.ID_CARD) {
                throw new UnauthorizedException("Authentication required to upload this file type");
            }
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");

        // Validation
        validateFile(file, purpose);

        try {
            if (originalName.contains("..")) {
                throw new BadRequestException("Filename contains invalid path sequence " + originalName);
            }

            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalName.substring(dotIndex);
            }

            String storedName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(storedName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileMetadata metadata = FileMetadata.builder()
                    .uploader(uploader)
                    .originalName(originalName)
                    .storedName(storedName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .purpose(purpose)
                    .build();

            fileMetadataRepository.save(metadata);

            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(storedName)
                    .toUriString();

            return FileUploadResponse.builder()
                    .originalName(originalName)
                    .storedName(storedName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .purpose(purpose)
                    .fileUrl(fileDownloadUri)
                    .build();

        } catch (IOException ex) {
            log.error("Could not store file {}. Please try again!", originalName, ex);
            throw new InternalServerException("Could not store file " + originalName + ". Please try again!");
        }
    }

    @Override
    public Resource loadAsResource(String storedName, UserDetails userDetails) {
        FileMetadata metadata = fileMetadataRepository.findByStoredName(storedName)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        checkReadAccess(metadata, userDetails);

        try {
            Path filePath = this.fileStorageLocation.resolve(storedName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on disk");
            }
        } catch (MalformedURLException ex) {
            throw new InternalServerException("File path is invalid");
        }
    }

    @Override
    public void deleteFile(String storedName, UserDetails userDetails) {
        FileMetadata metadata = fileMetadataRepository.findByStoredName(storedName)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        checkWriteAccess(metadata, userDetails);

        try {
            Path filePath = this.fileStorageLocation.resolve(storedName).normalize();
            Files.deleteIfExists(filePath);
            fileMetadataRepository.delete(metadata);
        } catch (IOException ex) {
            throw new InternalServerException("Could not delete file " + storedName);
        }
    }

    private void validateFile(MultipartFile file, FilePurpose purpose) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file");
        }

        String contentType = file.getContentType();
        long size = file.getSize();

        long maxImageSize = 5 * 1024 * 1024; // 5MB
        long maxDocSize = 10 * 1024 * 1024; // 10MB

        switch (purpose) {
            case PROFILE_IMAGE:
            case ITEM_IMAGE:
                if (!IMAGE_TYPES.contains(contentType)) {
                    throw new BadRequestException("Only JPEG/PNG/WEBP images are allowed for this purpose");
                }
                if (size > maxImageSize) {
                    throw new BadRequestException("Image size exceeds 5MB limit");
                }
                break;
            case DISPUTE_EVIDENCE:
            case MESSAGE_ATTACHMENT:
            case ID_CARD:
                if (!DOC_TYPES.contains(contentType) && !IMAGE_TYPES.contains(contentType)) {
                    throw new BadRequestException("Only Images and PDFs are allowed");
                }
                if (size > maxDocSize) {
                    throw new BadRequestException("File size exceeds 10MB limit");
                }
                break;
            default:
                throw new BadRequestException("Invalid file purpose");
        }
    }

    private void checkReadAccess(FileMetadata metadata, UserDetails userDetails) {
        if (metadata.getPurpose() == FilePurpose.PROFILE_IMAGE || metadata.getPurpose() == FilePurpose.ITEM_IMAGE) {
            return; // Publicly readable
        }

        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required to view this file");
        }

        User requester = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        boolean isOwner = metadata.getUploader().getUserId().equals(requester.getUserId());
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(RoleConstants.ROLE_ADMIN) || auth.equals(RoleConstants.ROLE_SUPER_ADMIN));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You do not have permission to view this file");
        }
    }

    private void checkWriteAccess(FileMetadata metadata, UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required");
        }

        User requester = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        boolean isOwner = metadata.getUploader().getUserId().equals(requester.getUserId());
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(RoleConstants.ROLE_ADMIN) || auth.equals(RoleConstants.ROLE_SUPER_ADMIN));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You do not have permission to modify this file");
        }
    }
}
