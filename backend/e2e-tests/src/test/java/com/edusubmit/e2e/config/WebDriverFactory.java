package com.edusubmit.e2e.config;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.safari.SafariDriver;
import org.openqa.selenium.safari.SafariOptions;

/**
 * Factory class for creating WebDriver instances
 */
public class WebDriverFactory {
    private static final ConfigReader config = ConfigReader.getInstance();

    /**
     * Create WebDriver instance based on browser configuration
     */
    public static WebDriver createDriver() {
        String browser = getBrowserName();
        boolean headless = isHeadlessMode();

        if (browser == null || browser.trim().isEmpty()) {
            browser = "chrome";
        }

        switch (browser.toLowerCase().trim()) {
            case "chrome":
                return createChromeDriver(headless);
            case "firefox":
                return createFirefoxDriver(headless);
            case "edge":
                return createEdgeDriver(headless);
            case "safari":
                return createSafariDriver();
            default:
                System.out.println("Unsupported browser: " + browser + ", defaulting to chrome");
                return createChromeDriver(headless);
        }
    }

    private static String getBrowserName() {
        // Check system property first (for CI/CD)
        String browser = System.getProperty("browser");
        if (browser != null) {
            return browser;
        }
        // Fall back to config, then default to chrome
        try {
            return config.getBrowser();
        } catch (Exception e) {
            return "chrome";
        }
    }

    private static boolean isHeadlessMode() {
        // Check system property first (for CI/CD)
        String headless = System.getProperty("headless");
        if (headless != null) {
            return Boolean.parseBoolean(headless);
        }
        // Fall back to config, then default to false
        try {
            return config.isHeadless();
        } catch (Exception e) {
            return false;
        }
    }

    private static WebDriver createChromeDriver(boolean headless) {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        
        if (headless) {
            options.addArguments("--headless=new");
        }
        
        // Common Chrome options
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");
        
        // Disable notifications
        options.addArguments("--disable-notifications");
        
        // Set user agent
        options.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        // Accept insecure certificates (for development)
        options.setAcceptInsecureCerts(true);
        
        return new ChromeDriver(options);
    }

    private static WebDriver createFirefoxDriver(boolean headless) {
        WebDriverManager.firefoxdriver().setup();
        FirefoxOptions options = new FirefoxOptions();
        
        if (headless) {
            options.addArguments("-headless");
        }
        
        options.addArguments("--width=1920");
        options.addArguments("--height=1080");
        
        return new FirefoxDriver(options);
    }

    private static WebDriver createEdgeDriver(boolean headless) {
        WebDriverManager.edgedriver().setup();
        EdgeOptions options = new EdgeOptions();
        
        if (headless) {
            options.addArguments("--headless");
        }
        
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");
        
        return new EdgeDriver(options);
    }

    private static WebDriver createSafariDriver() {
        SafariOptions options = new SafariOptions();
        return new SafariDriver(options);
    }
}
