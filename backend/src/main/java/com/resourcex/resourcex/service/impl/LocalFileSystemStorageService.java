package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.service.StorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileSystemStorageService implements StorageService {

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        // TODO: Implement local file system storage logic
        // E.g., save to a configurable directory and return the relative URL
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public String storeBase64File(String base64Data, String fileName) throws IOException {
        // TODO: Implement base64 decoding and local file system storage logic
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void deleteFile(String fileUrl) {
        // TODO: Implement local file deletion logic
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
