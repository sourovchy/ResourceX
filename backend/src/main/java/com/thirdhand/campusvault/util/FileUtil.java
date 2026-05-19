package com.thirdhand.campusvault.util;

import java.util.UUID;

public class FileUtil {

    private FileUtil() {
    }

    public static String generateUniqueFileName(String originalFileName) {

        if (originalFileName == null || originalFileName.isBlank()) {
            return UUID.randomUUID().toString();
        }

        return UUID.randomUUID() + "_" + originalFileName;
    }

    public static boolean isImageFile(String fileName) {

        if (fileName == null) {
            return false;
        }

        String lowerCase = fileName.toLowerCase();

        return lowerCase.endsWith(".jpg")
                || lowerCase.endsWith(".jpeg")
                || lowerCase.endsWith(".png")
                || lowerCase.endsWith(".webp");
    }
}