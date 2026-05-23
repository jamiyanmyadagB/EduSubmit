package com.edusubmit.e2e.tests;

import com.edusubmit.e2e.base.BaseTest;
import com.edusubmit.e2e.config.ConfigReader;
import com.edusubmit.e2e.pages.AdminDashboardPage;
import com.edusubmit.e2e.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * E2E tests for Admin Dashboard
 */
public class AdminDashboardTest extends BaseTest {
    private AdminDashboardPage adminDashboard;

    @BeforeMethod(alwaysRun = true)
    public void loginAsAdmin() {
        // Login as admin
        LoginPage loginPage = new LoginPage(driver);
        adminDashboard = (AdminDashboardPage) loginPage.login(
            config.getTestAdminEmail(),
            config.getTestAdminPassword(),
            "ADMIN"
        );
    }

    @Test(description = "Verify admin dashboard is displayed")
    public void testAdminDashboardDisplay() {
        Assert.assertTrue(adminDashboard.isPageLoaded(), "Admin dashboard should be loaded");
        Assert.assertTrue(adminDashboard.isSidebarDisplayed(), "Sidebar should be displayed");
        Assert.assertTrue(adminDashboard.isStatsCardDisplayed(), "Stats card should be displayed");
    }

    @Test(description = "Verify user table is displayed")
    public void testUserTableDisplay() {
        adminDashboard.navigateToUserManagement();
        
        Assert.assertTrue(adminDashboard.isUserTableDisplayed(), "User table should be displayed");
    }

    @Test(description = "Verify create user button is displayed")
    public void testCreateUserButton() {
        adminDashboard.navigateToUserManagement();
        
        Assert.assertTrue(adminDashboard.isCreateUserButtonDisplayed(), "Create user button should be displayed");
    }

    @Test(description = "Verify create user functionality")
    public void testCreateUser() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickCreateUser();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("create") || driver.getCurrentUrl().contains("user"), 
            "Should navigate to create user page");
    }

    @Test(description = "Verify edit user functionality")
    public void testEditUser() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickEditUser();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("edit") || driver.getCurrentUrl().contains("user"), 
            "Should navigate to edit user page");
    }

    @Test(description = "Verify delete user functionality")
    public void testDeleteUser() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickDeleteUser();
        
        // Should show confirmation dialog
        webDriverUtils.waitForPageLoad();
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector(".confirm-dialog")
        ), "Confirmation dialog should be displayed");
    }

    @Test(description = "Verify reset password functionality")
    public void testResetPassword() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickResetPassword();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("password") || driver.getCurrentUrl().contains("reset"), 
            "Should navigate to password reset page");
    }

    @Test(description = "Verify assign role functionality")
    public void testAssignRole() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickAssignRole();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("role") || driver.getCurrentUrl().contains("assign"), 
            "Should navigate to role assignment page");
    }

    @Test(description = "Verify disable user functionality")
    public void testDisableUser() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickDisableUser();
        
        // Should show confirmation dialog
        webDriverUtils.waitForPageLoad();
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector(".confirm-dialog")
        ), "Confirmation dialog should be displayed");
    }

    @Test(description = "Verify enable user functionality")
    public void testEnableUser() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickEnableUser();
        
        // Should show confirmation dialog
        webDriverUtils.waitForPageLoad();
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector(".confirm-dialog")
        ), "Confirmation dialog should be displayed");
    }

    @Test(description = "Verify suspend user functionality")
    public void testSuspendUser() {
        adminDashboard.navigateToUserManagement();
        adminDashboard.clickSuspendUser();
        
        // Should show confirmation dialog
        webDriverUtils.waitForPageLoad();
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector(".confirm-dialog")
        ), "Confirmation dialog should be displayed");
    }

    @Test(description = "Verify department management navigation")
    public void testDepartmentManagement() {
        adminDashboard.navigateToDepartmentManagement();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("department"), "Should navigate to department management");
        Assert.assertTrue(adminDashboard.isDepartmentTableDisplayed(), "Department table should be displayed");
    }

    @Test(description = "Verify activity logs navigation")
    public void testActivityLogs() {
        adminDashboard.navigateToActivityLogs();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("activity") || driver.getCurrentUrl().contains("log"), 
            "Should navigate to activity logs");
        Assert.assertTrue(adminDashboard.isActivityLogTableDisplayed(), "Activity log table should be displayed");
    }

    @Test(description = "Verify system monitoring navigation")
    public void testSystemMonitoring() {
        adminDashboard.navigateToSystemMonitoring();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("monitor") || driver.getCurrentUrl().contains("system"), 
            "Should navigate to system monitoring");
    }

    @Test(description = "Verify plagiarism reports navigation")
    public void testPlagiarismReports() {
        adminDashboard.navigateToPlagiarismReports();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("plagiarism"), "Should navigate to plagiarism reports");
    }

    @Test(description = "Verify welcome message is displayed")
    public void testWelcomeMessage() {
        String welcomeMessage = adminDashboard.getWelcomeMessage();
        Assert.assertNotNull(welcomeMessage, "Welcome message should be displayed");
        Assert.assertTrue(welcomeMessage.length() > 0, "Welcome message should not be empty");
    }

    @Test(description = "Verify recent activity is displayed")
    public void testRecentActivity() {
        Assert.assertTrue(adminDashboard.isRecentActivityDisplayed(), "Recent activity should be displayed");
    }
}
