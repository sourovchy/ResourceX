package com.thirdhand.campusvault.util.constants;

public class RegexConstants {

    private RegexConstants() {
    }

    public static final String EMAIL_REGEX =
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

    public static final String PHONE_REGEX =
            "^(\\+8801|01)[3-9]\\d{8}$";

    public static final String PASSWORD_REGEX =
            "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@#$%^&+=!]{8,}$";
}