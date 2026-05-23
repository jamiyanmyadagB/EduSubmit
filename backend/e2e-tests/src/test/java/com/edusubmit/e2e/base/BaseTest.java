package com.edusubmit.e2e.base;

import com.edusubmit.e2e.config.ConfigReader;
import com.edusubmit.e2e.config.WebDriverFactory;
import com.edusubmit.e2e.utils.ScreenshotUtils;
import com.edusubmit.e2e.utils.WebDriverUtils;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.*;

/**
 * Base test class for all E2E tests
 * Provides common setup and teardown methods
 */
public abstract class BaseTest {
    protected WebDriver driver;
    protected WebDriverUtils webDriverUtils;
    protected ScreenshotUtils screenshotUtils;
    protected ConfigReader config;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        // Initialize configuration
        config = ConfigReader.getInstance();

        // Create WebDriver instance
        driver = WebDriverFactory.createDriver();

        // Initialize utilities
        webDriverUtils = new WebDriverUtils(driver);
        screenshotUtils = new ScreenshotUtils(driver);

        // Set implicit wait
        driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(config.getImplicitWait()));

        // Maximize window
        driver.manage().window().maximize();

        // Navigate to base URL with fallback
        String baseUrl = config.getBaseUrl();
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            baseUrl = "http://localhost:3000";
        }
        System.out.println("Navigating to: " + baseUrl);
        driver.get(baseUrl);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        // Capture screenshot on test failure
        if (result.getStatus() == ITestResult.FAILURE) {
            String screenshotPath = screenshotUtils.captureFailureScreenshot(
                result.getMethod().getMethodName(),
                result.getThrowable().getMessage()
            );
            System.out.println("Screenshot captured at: " + screenshotPath);
        }

        // Quit driver
        if (driver != null) {
            driver.quit();
        }
    }

    @BeforeSuite(alwaysRun = true)
    public void beforeSuite() {
        System.out.println("=== Starting E2E Test Suite ===");
        ConfigReader configReader = ConfigReader.getInstance();
        System.out.println("Browser: " + configReader.getBrowser());
        System.out.println("Headless: " + configReader.isHeadless());
        System.out.println("Base URL: " + configReader.getBaseUrl());
    }

    @AfterSuite(alwaysRun = true)
    public void afterSuite() {
        System.out.println("=== E2E Test Suite Completed ===");
    }

    /**
     * Get current page title
     */
    protected String getPageTitle() {
        return driver.getTitle();
    }

    /**
     * Get current URL
     */
    protected String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    /**
     * Navigate to specific URL
     */
    protected void navigateTo(String url) {
        driver.get(url);
    }

    /**
     * Refresh current page
     */
    protected void refreshPage() {
        driver.navigate().refresh();
    }

    /**
     * Go back in browser history
     */
    protected void goBack() {
        driver.navigate().back();
    }

    /**
     * Go forward in browser history
     */
    protected void goForward() {
        driver.navigate().forward();
    }
}
