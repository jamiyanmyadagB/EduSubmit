package com.edusubmit.e2e.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Configuration reader for loading test configuration from properties file
 */
public class ConfigReader {
    private static final String CONFIG_FILE = "/config.properties";
    private static Properties properties;
    private static ConfigReader instance;

    private ConfigReader() {
        loadProperties();
    }

    public static synchronized ConfigReader getInstance() {
        if (instance == null) {
            instance = new ConfigReader();
        }
        return instance;
    }

    private void loadProperties() {
        properties = new Properties();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            if (is == null) {
                throw new RuntimeException("Configuration file not found: config.properties");
            }
            properties.load(is);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load configuration file: config.properties", e);
        }
    }

    public String getProperty(String key) {
        String value = properties.getProperty(key);
        if (value == null) {
            throw new RuntimeException("Property not found: " + key);
        }
        return value;
    }

    public String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public int getIntProperty(String key) {
        return Integer.parseInt(getProperty(key));
    }

    public int getIntProperty(String key, int defaultValue) {
        try {
            return Integer.parseInt(getProperty(key));
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public boolean getBooleanProperty(String key) {
        return Boolean.parseBoolean(getProperty(key));
    }

    public boolean getBooleanProperty(String key, boolean defaultValue) {
        try {
            return Boolean.parseBoolean(getProperty(key));
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public String getBrowser() {
        String browser = getProperty("browser", "chrome");
        if (browser == null || browser.trim().isEmpty()) {
            return "chrome";
        }
        return browser.trim();
    }

    public boolean isHeadless() {
        return getBooleanProperty("headless", false);
    }

    public String getBaseUrl() {
        // Check system property first (for CI/CD)
        String baseUrl = System.getProperty("baseUrl");
        if (baseUrl != null) {
            return baseUrl;
        }
        return getProperty("base.url", "http://localhost:3000");
    }

    public String getApiUrl() {
        return getProperty("api.url", "http://localhost:8080");
    }

    public int getImplicitWait() {
        return getIntProperty("implicit.wait", 10);
    }

    public int getExplicitWait() {
        return getIntProperty("explicit.wait", 30);
    }

    public int getPageLoadTimeout() {
        return getIntProperty("page.load.timeout", 30);
    }

    public String getTestStudentEmail() {
        return getProperty("test.user.student.email");
    }

    public String getTestStudentPassword() {
        return getProperty("test.user.student.password");
    }

    public String getTestTeacherEmail() {
        return getProperty("test.user.teacher.email");
    }

    public String getTestTeacherPassword() {
        return getProperty("test.user.teacher.password");
    }

    public String getTestAdminEmail() {
        return getProperty("test.user.admin.email");
    }

    public String getTestAdminPassword() {
        return getProperty("test.user.admin.password");
    }

    public boolean isScreenshotOnFailure() {
        return getBooleanProperty("screenshot.on.failure", true);
    }

    public String getScreenshotDirectory() {
        return getProperty("screenshot.directory", "target/screenshots");
    }

    public String getReportDirectory() {
        return getProperty("report.directory", "target/test-reports");
    }
}
