package com.resourcex.resourcex.util.constants;

public final class AppConstants {

    private AppConstants() {
    }

    public static final String APP_NAME = "ResourceX";

    public static final String API_BASE_PATH = "/api";

    public static final String AUTH_HEADER = "Authorization";

    public static final String BEARER_PREFIX = "Bearer ";

    public static final int DEFAULT_PAGE_SIZE = 10;

    public static final int MAX_PAGE_SIZE = 100;

    public static final long JWT_EXPIRATION = 86400000L;
}