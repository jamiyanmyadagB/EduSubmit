package com.edusubmit.e2e.utils;

import com.edusubmit.e2e.config.ConfigReader;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Utility class for capturing screenshots
 */
public class ScreenshotUtils {
    private final WebDriver driver;
    private final ConfigReader config;

    public ScreenshotUtils(WebDriver driver) {
        this.driver = driver;
        this.config = ConfigReader.getInstance();
    }

    /**
     * Capture screenshot and save to file
     */
    public String captureScreenshot(String testName) {
        return captureScreenshot(testName, null);
    }

    /**
     * Capture screenshot with custom suffix
     */
    public String captureScreenshot(String testName, String suffix) {
        if (!config.isScreenshotOnFailure()) {
            return null;
        }

        try {
            // Create screenshot directory if it doesn't exist
            String screenshotDir = config.getScreenshotDirectory();
            Path path = Paths.get(screenshotDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }

            // Generate filename with timestamp
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
            String timestamp = dateFormat.format(new Date());
            String fileName = testName + "_" + timestamp;
            if (suffix != null && !suffix.isEmpty()) {
                fileName += "_" + suffix;
            }
            fileName += ".png";

            // Capture screenshot
            File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            File destination = new File(screenshotDir, fileName);
            org.apache.commons.io.FileUtils.copyFile(screenshot, destination);

            return destination.getAbsolutePath();
        } catch (IOException e) {
            throw new RuntimeException("Failed to capture screenshot", e);
        }
    }

    /**
     * Capture screenshot as byte array
     */
    public byte[] captureScreenshotAsBytes() {
        return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
    }

    /**
     * Capture screenshot for failed test
     */
    public String captureFailureScreenshot(String testName, String errorMessage) {
        return captureScreenshot(testName, "FAILURE_" + errorMessage.replaceAll("[^a-zA-Z0-9]", "_"));
    }

    /**
     * Capture screenshot for passed test
     */
    public String captureSuccessScreenshot(String testName) {
        return captureScreenshot(testName, "SUCCESS");
    }
}
