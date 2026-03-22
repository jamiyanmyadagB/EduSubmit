package com.edusubmit.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {
    private final HttpStatus httpStatus;
    
    public BusinessException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }
    
    public BusinessException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }
    
    public BusinessException(String message, Throwable cause) {
        this(message, cause, HttpStatus.BAD_REQUEST);
    }
    
    public BusinessException(String message, Throwable cause, HttpStatus httpStatus) {
        super(message, cause);
        this.httpStatus = httpStatus;
    }
}
