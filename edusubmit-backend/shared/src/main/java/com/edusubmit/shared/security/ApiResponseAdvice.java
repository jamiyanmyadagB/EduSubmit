package com.edusubmit.shared.security;

import com.edusubmit.shared.api.ApiError;
import com.edusubmit.shared.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Ensures all exceptions return the required response wrapper:
 * { success: false, data: null, message: "..." }
 */
@RestControllerAdvice
public class ApiResponseAdvice {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handle(Exception ex) {
        String msg = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
        return new ResponseEntity<>(new ApiResponse<>(false, null, msg), HttpStatus.BAD_REQUEST);
    }
}

