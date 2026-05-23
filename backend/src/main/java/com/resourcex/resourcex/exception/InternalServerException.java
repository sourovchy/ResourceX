package com.resourcex.resourcex.exception;

/**
 * Thrown when an unexpected server-side error occurs.
 */
public class InternalServerException extends RuntimeException {

    public InternalServerException(String message) {
        super(message);
    }

    public InternalServerException(String message, Throwable cause) {
        super(message, cause);
    }
}