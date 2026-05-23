package com.edusubmit.shared.enums;

public enum AssignmentStatus {
    DRAFT("DRAFT", "Draft"),
    PUBLISHED("PUBLISHED", "Published"),
    ACTIVE("ACTIVE", "Active"),
    CLOSED("CLOSED", "Closed"),
    ARCHIVED("ARCHIVED", "Archived");
    
    private final String code;
    private final String displayName;
    
    AssignmentStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static AssignmentStatus fromCode(String code) {
        for (AssignmentStatus status : AssignmentStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status code: " + code);
    }
}
