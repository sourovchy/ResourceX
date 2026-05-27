package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.FileUploadResponse;
import com.resourcex.resourcex.entity.FilePurpose;
import org.springframework.core.io.Resource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Store a file with a specific purpose.
     */
    FileUploadResponse storeFile(MultipartFile file, FilePurpose purpose, UserDetails userDetails);

    /**
     * Store a file from a base64 string (useful for migrating existing data or API uploads).
     */
    FileUploadResponse storeBase64File(String base64Data, String fileName, FilePurpose purpose, UserDetails userDetails);

    /**
     * Load a file as a resource. Validates permissions if the file is private.
     */
    Resource loadAsResource(String storedName, UserDetails userDetails);

    /**
     * Delete a file by stored name.
     */
    void deleteFile(String storedName, UserDetails userDetails);
}
