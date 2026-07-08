package com.resourcex.resourcex.service;

import com.resourcex.resourcex.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Resolves a user's {@code avatar_file_id} to a servable URL ({@code /api/files/{storedName}}),
 * the single source of truth for avatars now living in the files table (purpose = AVATAR).
 */
@Component
@RequiredArgsConstructor
public class AvatarUrlResolver {

    private final FileMetadataRepository fileMetadataRepository;

    public String resolve(Long avatarFileId) {
        if (avatarFileId == null) {
            return null;
        }
        return fileMetadataRepository.findById(avatarFileId)
                .map(file -> "/api/files/" + file.getStoredName())
                .orElse(null);
    }
}
