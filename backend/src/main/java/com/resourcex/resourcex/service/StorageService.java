package com.resourcex.resourcex.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    
    /**
     * Store a file and return the generated URL or path.
     */
    String storeFile(MultipartFile file) throws IOException;

    /**
     * Store a file from a base64 string (useful for migrating existing data).
     */
    String storeBase64File(String base64Data, String fileName) throws IOException;

    /**
     * Delete a file by its URL or path.
     */
    void deleteFile(String fileUrl);
}
