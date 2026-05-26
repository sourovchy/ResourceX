package com.resourcex.resourcex.util;

public final class PhoneUtil {

    private PhoneUtil() {
    }

    public static String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return phone;
        }
        String cleaned = phone.replaceAll("[\\s-]", "");
        if (cleaned.startsWith("01")) {
            return "+88" + cleaned;
        }
        return cleaned;
    }
}
