package com.resourcex.resourcex.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Please provide a password to hash.");
            return;
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = args[0];
        String hashedPassword = encoder.encode(rawPassword);

        System.out.println("Raw Password: " + rawPassword);
        System.out.println("Hashed Password: " + hashedPassword);
    }
}
