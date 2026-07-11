package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.FileUploadResponse;
import com.resourcex.resourcex.entity.FilePurpose;
import com.resourcex.resourcex.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("purpose") FilePurpose purpose,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null && purpose != FilePurpose.STUDENT_ID) {
            throw new com.resourcex.resourcex.exception.UnauthorizedException("Authentication required for this upload purpose");
        }

        FileUploadResponse response = fileStorageService.storeFile(file, purpose, userDetails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{storedName}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String storedName,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        Resource resource = fileStorageService.loadAsResource(storedName, userDetails);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Fallback content type
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{storedName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String storedName,
            @AuthenticationPrincipal UserDetails userDetails) {

        fileStorageService.deleteFile(storedName, userDetails);
        return ResponseEntity.noContent().build();
    }
}
