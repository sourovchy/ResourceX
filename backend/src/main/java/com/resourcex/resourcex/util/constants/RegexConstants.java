package com.resourcex.resourcex.util.constants;

public final class RegexConstants {

        private RegexConstants() {
        }

        public static final String EMAIL_REGEX =
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

        public static final String PHONE_REGEX = "^(\\+8801|01)[3-9]\\d{8}$";

        public static final String PASSWORD_REGEX =
                        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$";
}