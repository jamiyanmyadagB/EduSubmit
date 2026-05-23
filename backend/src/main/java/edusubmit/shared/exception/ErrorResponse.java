package com.edusubmit.shared.exception;

import java.util.Map;

public class ErrorResponse {
    private String message;
    private int status;
    private String errorType;
    private String path;
    private String details;
    private Map<String, String> validationErrors;
    private long timestamp;

    // Simple constructor
    public ErrorResponse(String message, int status, long timestamp) {
        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
    }

    // Full constructor
    public ErrorResponse(String message, int status, String errorType, String path, long timestamp) {
        this.message = message;
        this.status = status;
        this.errorType = errorType;
        this.path = path;
        this.timestamp = timestamp;
    }

    // Full constructor with details
    public ErrorResponse(String message, int status, String errorType, String path, String details, long timestamp) {
        this.message = message;
        this.status = status;
        this.errorType = errorType;
        this.path = path;
        this.details = details;
        this.timestamp = timestamp;
    }

    // Full constructor with validation errors
    public ErrorResponse(String message, int status, String errorType, String path, Map<String, String> validationErrors, String details, long timestamp) {
        this.message = message;
        this.status = status;
        this.errorType = errorType;
        this.path = path;
        this.validationErrors = validationErrors;
        this.details = details;
        this.timestamp = timestamp;
    }

    public String getMessage() { return message; }
    public int getStatus() { return status; }
    public String getErrorType() { return errorType; }
    public String getPath() { return path; }
    public String getDetails() { return details; }
    public Map<String, String> getValidationErrors() { return validationErrors; }
    public long getTimestamp() { return timestamp; }
}
