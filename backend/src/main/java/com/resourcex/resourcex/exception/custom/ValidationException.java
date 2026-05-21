package com.resourcex.resourcex.exception.custom;

public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}