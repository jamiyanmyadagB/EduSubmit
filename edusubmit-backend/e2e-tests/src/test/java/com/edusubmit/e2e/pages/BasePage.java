package com.edusubmit.e2e.pages;

import com.edusubmit.e2e.utils.WebDriverUtils;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

/**
 * Base page class for all Page Object Model classes
 * Provides common page elements and methods
 */
public abstract class BasePage {
    protected WebDriver driver;
    protected WebDriverUtils webDriverUtils;

    // Common elements across all pages
    @FindBy(css = "nav a[href='/']")
    protected WebElement homeLink;

    @FindBy(css = "nav a[href='/login']")
    protected WebElement loginLink;

    @FindBy(css = "nav a[href='/dashboard']")
    protected WebElement dashboardLink;

    @FindBy(css = "nav a[href='/profile']")
    protected WebElement profileLink;

    @FindBy(css = "button[aria-label='logout']")
    protected WebElement logoutButton;

    @FindBy(css = ".notification-icon")
    protected WebElement notificationIcon;

    @FindBy(css = ".loading-spinner")
    protected WebElement loadingSpinner;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.webDriverUtils = new WebDriverUtils(driver);
        PageFactory.initElements(driver, this);
    }

    /**
     * Check if page is loaded
     */
    public abstract boolean isPageLoaded();

    /**
     * Get page title
     */
    public String getPageTitle() {
        return driver.getTitle();
    }

    /**
     * Get current URL
     */
    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    /**
     * Navigate to home page
     */
    public void navigateToHome() {
        homeLink.click();
    }

    /**
     * Navigate to login page
     */
    public void navigateToLogin() {
        loginLink.click();
    }

    /**
     * Navigate to dashboard
     */
    public void navigateToDashboard() {
        dashboardLink.click();
    }

    /**
     * Navigate to profile
     */
    public void navigateToProfile() {
        profileLink.click();
    }

    /**
     * Logout
     */
    public void logout() {
        logoutButton.click();
    }

    /**
     * Check if user is logged in
     */
    public boolean isLoggedIn() {
        return logoutButton.isDisplayed();
    }

    /**
     * Wait for page to load completely
     */
    public void waitForPageLoad() {
        webDriverUtils.waitForPageLoad();
    }

    /**
     * Wait for loading spinner to disappear
     */
    public void waitForLoadingToComplete() {
        webDriverUtils.waitForInvisibility(org.openqa.selenium.By.cssSelector(".loading-spinner"));
    }
}
