package com.edusubmit.shared.enums;

public enum SubmissionStatus {
    DRAFT("DRAFT", "Draft"),
    SUBMITTED("SUBMITTED", "Submitted"),
    UNDER_REVIEW("UNDER_REVIEW", "Under Review"),
    GRADED("GRADED", "Graded"),
    RETURNED("RETURNED", "Returned"),
    PLAGIARISM_DETECTED("PLAGIARISM_DETECTED", "Plagiarism Detected");
    
    private final String code;
    private final String displayName;
    
    SubmissionStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static SubmissionStatus fromCode(String code) {
        for (SubmissionStatus status : SubmissionStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status code: " + code);
    }
}
