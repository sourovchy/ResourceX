package com.resourcex.resourcex.util;

import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

public class KeysUtil {

    private KeysUtil() {
    }

    public static SecretKey getSigningKey(String secretKey) {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }
}