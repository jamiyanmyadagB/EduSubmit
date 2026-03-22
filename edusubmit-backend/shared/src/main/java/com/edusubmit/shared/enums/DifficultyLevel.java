package com.edusubmit.shared.enums;

public enum DifficultyLevel {
    BEGINNER("BEGINNER", "Beginner", 1),
    INTERMEDIATE("INTERMEDIATE", "Intermediate", 2),
    ADVANCED("ADVANCED", "Advanced", 3),
    EXPERT("EXPERT", "Expert", 4);
    
    private final String code;
    private final String displayName;
    private final int level;
    
    DifficultyLevel(String code, String displayName, int level) {
        this.code = code;
        this.displayName = displayName;
        this.level = level;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getLevel() {
        return level;
    }
    
    public static DifficultyLevel fromCode(String code) {
        for (DifficultyLevel difficulty : DifficultyLevel.values()) {
            if (difficulty.getCode().equals(code)) {
                return difficulty;
            }
        }
        throw new IllegalArgumentException("Unknown difficulty code: " + code);
    }
}
