package com.edusubmit.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object Model for Admin Dashboard
 */
public class AdminDashboardPage extends DashboardPage {
    // Admin-specific elements
    @FindBy(css = ".admin-dashboard")
    private WebElement adminDashboard;

    @FindBy(css = ".user-management-link")
    private WebElement userManagementLink;

    @FindBy(css = ".department-management-link")
    private WebElement departmentManagementLink;

    @FindBy(css = ".activity-logs-link")
    private WebElement activityLogsLink;

    @FindBy(css = ".system-monitoring-link")
    private WebElement systemMonitoringLink;

    @FindBy(css = ".plagiarism-reports-link")
    private WebElement plagiarismReportsLink;

    @FindBy(css = ".create-user-button")
    private WebElement createUserButton;

    @FindBy(css = ".edit-user-button")
    private WebElement editUserButton;

    @FindBy(css = ".delete-user-button")
    private WebElement deleteUserButton;

    @FindBy(css = ".reset-password-button")
    private WebElement resetPasswordButton;

    @FindBy(css = ".assign-role-button")
    private WebElement assignRoleButton;

    @FindBy(css = ".disable-user-button")
    private WebElement disableUserButton;

    @FindBy(css = ".enable-user-button")
    private WebElement enableUserButton;

    @FindBy(css = ".suspend-user-button")
    private WebElement suspendUserButton;

    @FindBy(css = ".user-table")
    private WebElement userTable;

    @FindBy(css = ".department-table")
    private WebElement departmentTable;

    @FindBy(css = ".activity-log-table")
    private WebElement activityLogTable;

    public AdminDashboardPage(WebDriver driver) {
        super(driver);
    }

    @Override
    public boolean isPageLoaded() {
        return webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector(".admin-dashboard"));
    }

    /**
     * Navigate to user management
     */
    public void navigateToUserManagement() {
        userManagementLink.click();
    }

    /**
     * Navigate to department management
     */
    public void navigateToDepartmentManagement() {
        departmentManagementLink.click();
    }

    /**
     * Navigate to activity logs
     */
    public void navigateToActivityLogs() {
        activityLogsLink.click();
    }

    /**
     * Navigate to system monitoring
     */
    public void navigateToSystemMonitoring() {
        systemMonitoringLink.click();
    }

    /**
     * Navigate to plagiarism reports
     */
    public void navigateToPlagiarismReports() {
        plagiarismReportsLink.click();
    }

    /**
     * Click create user button
     */
    public void clickCreateUser() {
        createUserButton.click();
    }

    /**
     * Click edit user button
     */
    public void clickEditUser() {
        editUserButton.click();
    }

    /**
     * Click delete user button
     */
    public void clickDeleteUser() {
        deleteUserButton.click();
    }

    /**
     * Click reset password button
     */
    public void clickResetPassword() {
        resetPasswordButton.click();
    }

    /**
     * Click assign role button
     */
    public void clickAssignRole() {
        assignRoleButton.click();
    }

    /**
     * Click disable user button
     */
    public void clickDisableUser() {
        disableUserButton.click();
    }

    /**
     * Click enable user button
     */
    public void clickEnableUser() {
        enableUserButton.click();
    }

    /**
     * Click suspend user button
     */
    public void clickSuspendUser() {
        suspendUserButton.click();
    }

    /**
     * Check if user table is displayed
     */
    public boolean isUserTableDisplayed() {
        return userTable.isDisplayed();
    }

    /**
     * Check if department table is displayed
     */
    public boolean isDepartmentTableDisplayed() {
        return departmentTable.isDisplayed();
    }

    /**
     * Check if activity log table is displayed
     */
    public boolean isActivityLogTableDisplayed() {
        return activityLogTable.isDisplayed();
    }

    /**
     * Check if create user button is displayed
     */
    public boolean isCreateUserButtonDisplayed() {
        return createUserButton.isDisplayed();
    }
}
