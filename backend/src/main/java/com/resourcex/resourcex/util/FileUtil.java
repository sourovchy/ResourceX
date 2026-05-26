package com.resourcex.resourcex.util;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

public final class FileUtil {

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
    );

    private FileUtil() {
    }

    public static String generateUniqueFileName(String originalFileName) {

        if (originalFileName == null || originalFileName.isBlank()) {
            return UUID.randomUUID().toString();
        }

        String sanitizedFileName = originalFileName
                .trim()
                .replace(" ", "_")
                .replaceAll("[^a-zA-Z0-9._-]", "");

        return UUID.randomUUID() + "_" + sanitizedFileName;
    }

    public static boolean isImageFile(String fileName) {

        if (fileName == null || fileName.isBlank()) {
            return false;
        }

        String lowerCase = fileName.trim().toLowerCase(Locale.ROOT);

        return ALLOWED_IMAGE_EXTENSIONS.stream()
                .anyMatch(lowerCase::endsWith);
    }
}