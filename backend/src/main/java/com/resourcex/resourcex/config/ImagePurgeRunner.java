package com.resourcex.resourcex.config;

import com.resourcex.resourcex.entity.FileMetadata;
import com.resourcex.resourcex.entity.FilePurpose;
import com.resourcex.resourcex.repository.FileMetadataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * One-time, opt-in purge of all stored item & avatar images (files on disk +
 * their {@code files} rows). Student-ID documents are left intact.
 *
 * GUARDED: it does nothing unless {@code app.purge-images-on-startup=true} is set
 * explicitly (the default is {@code false}, so a normal boot — and every other
 * environment — is unaffected). Intended workflow:
 *   1. Back up the DB and the uploads directory.
 *   2. Start once with {@code --app.purge-images-on-startup=true}.
 *   3. Remove the flag and restart.
 *
 * After purging, item/avatar images simply resolve to the UI's fallbacks until
 * users re-upload (new uploads are stored as compressed WebP by the client).
 */
@Component
@Slf4j
@ConditionalOnProperty(name = "app.purge-images-on-startup", havingValue = "true")
public class ImagePurgeRunner implements ApplicationRunner {

    private static final String URL_PREFIX = "/api/files/";

    private final FileMetadataRepository fileMetadataRepository;
    private final Path storageRoot;

    public ImagePurgeRunner(FileMetadataRepository fileMetadataRepository,
                            @Value("${storage.local-dir:uploads}") String localDir) {
        this.fileMetadataRepository = fileMetadataRepository;
        this.storageRoot = Paths.get(localDir).toAbsolutePath().normalize();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<FileMetadata> targets = fileMetadataRepository.findByPurposeIn(
                List.of(FilePurpose.ITEM_IMAGE, FilePurpose.AVATAR));

        log.warn("[ImagePurge] Purging {} item/avatar image(s) — flag app.purge-images-on-startup is ON.",
                targets.size());

        int filesDeleted = 0;
        for (FileMetadata meta : targets) {
            String fileUrl = meta.getFileUrl();
            String fileName = fileUrl != null && fileUrl.startsWith(URL_PREFIX)
                    ? fileUrl.substring(URL_PREFIX.length())
                    : (fileUrl != null ? fileUrl.substring(fileUrl.lastIndexOf('/') + 1) : null);
            if (fileName != null && !fileName.isBlank()) {
                try {
                    Path file = storageRoot.resolve(fileName).normalize();
                    if (file.startsWith(storageRoot) && Files.deleteIfExists(file)) {
                        filesDeleted++;
                    }
                } catch (Exception e) {
                    log.warn("[ImagePurge] Could not delete file {}", fileName, e);
                }
            }
        }

        fileMetadataRepository.deleteAll(targets);
        log.warn("[ImagePurge] Done. Deleted {} disk file(s) and {} files row(s). "
                        + "Remove the app.purge-images-on-startup flag and restart.",
                filesDeleted, targets.size());
    }
}
