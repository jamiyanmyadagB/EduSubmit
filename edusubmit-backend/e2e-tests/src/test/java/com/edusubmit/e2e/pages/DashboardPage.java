package com.edusubmit.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Base Page Object Model for Dashboard Pages
 * Extended by StudentDashboard, FacultyDashboard, and AdminDashboard
 */
public class DashboardPage extends BasePage {
    // Common dashboard elements
    @FindBy(css = ".dashboard-container")
    protected WebElement dashboardContainer;

    @FindBy(css = ".user-profile")
    protected WebElement userProfile;

    @FindBy(css = ".sidebar")
    protected WebElement sidebar;

    @FindBy(css = ".sidebar a[href='/assignments']")
    protected WebElement assignmentsLink;

    @FindBy(css = ".sidebar a[href='/submissions']")
    protected WebElement submissionsLink;

    @FindBy(css = ".sidebar a[href='/notifications']")
    protected WebElement notificationsLink;

    @FindBy(css = ".sidebar a[href='/profile']")
    protected WebElement profileLink;

    @FindBy(css = ".sidebar a[href='/settings']")
    protected WebElement settingsLink;

    @FindBy(css = ".welcome-message")
    protected WebElement welcomeMessage;

    @FindBy(css = ".stats-card")
    protected WebElement statsCard;

    @FindBy(css = ".recent-activity")
    protected WebElement recentActivity;

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    @Override
    public boolean isPageLoaded() {
        return webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector(".dashboard-container"));
    }

    /**
     * Get welcome message
     */
    public String getWelcomeMessage() {
        return welcomeMessage.getText();
    }

    /**
     * Navigate to assignments
     */
    public void navigateToAssignments() {
        assignmentsLink.click();
    }

    /**
     * Navigate to submissions
     */
    public void navigateToSubmissions() {
        submissionsLink.click();
    }

    /**
     * Navigate to notifications
     */
    public void navigateToNotifications() {
        notificationsLink.click();
    }

    /**
     * Navigate to profile
     */
    public void navigateToProfile() {
        profileLink.click();
    }

    /**
     * Navigate to settings
     */
    public void navigateToSettings() {
        settingsLink.click();
    }

    /**
     * Check if sidebar is displayed
     */
    public boolean isSidebarDisplayed() {
        return sidebar.isDisplayed();
    }

    /**
     * Check if stats card is displayed
     */
    public boolean isStatsCardDisplayed() {
        return statsCard.isDisplayed();
    }

    /**
     * Check if recent activity is displayed
     */
    public boolean isRecentActivityDisplayed() {
        return recentActivity.isDisplayed();
    }

    /**
     * Get user name from profile
     */
    public String getUserName() {
        return userProfile.getText();
    }
}
