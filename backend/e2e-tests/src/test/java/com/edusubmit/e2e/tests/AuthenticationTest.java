package com.edusubmit.e2e.tests;

import com.edusubmit.e2e.base.BaseTest;
import com.edusubmit.e2e.config.ConfigReader;
import com.edusubmit.e2e.pages.DashboardPage;
import com.edusubmit.e2e.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * E2E tests for Authentication flow
 */
public class AuthenticationTest extends BaseTest {
    // No additional setup needed - uses parent's setUp

    @Test(description = "Verify login page is displayed correctly")
    public void testLoginPageDisplay() {
        LoginPage loginPage = new LoginPage(driver);
        
        Assert.assertTrue(loginPage.isPageLoaded(), "Login page should be loaded");
        Assert.assertNotNull(loginPage.getPageTitleText(), "Page title should be displayed");
    }

    @Test(description = "Verify successful login with valid credentials")
    public void testSuccessfulLogin() {
        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboardPage = loginPage.login(
            config.getTestStudentEmail(),
            config.getTestStudentPassword(),
            "STUDENT"
        );
        
        Assert.assertTrue(dashboardPage.isPageLoaded(), "Dashboard should be loaded after login");
        Assert.assertTrue(dashboardPage.isLoggedIn(), "User should be logged in");
    }

    @Test(description = "Verify login fails with invalid credentials")
    public void testInvalidCredentials() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.enterEmail("invalid@lpu.in")
                   .enterPassword("wrongpassword")
                   .clickLogin();
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed");
        Assert.assertNotNull(loginPage.getErrorMessage(), "Error message should not be null");
    }

    @Test(description = "Verify login fails with empty email")
    public void testEmptyEmail() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.enterEmail("")
                   .enterPassword(config.getTestStudentPassword())
                   .clickLogin();
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed");
    }

    @Test(description = "Verify login fails with empty password")
    public void testEmptyPassword() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.enterEmail(config.getTestStudentEmail())
                   .enterPassword("")
                   .clickLogin();
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed");
    }

    @Test(description = "Verify role selection functionality")
    public void testRoleSelection() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.enterEmail(config.getTestStudentEmail())
                   .enterPassword(config.getTestStudentPassword())
                   .selectRole("TEACHER")
                   .clickLogin();
        
        // Should redirect to teacher dashboard
        Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"), "Should redirect to dashboard");
    }

    @Test(description = "Verify logout functionality")
    public void testLogout() {
        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboardPage = loginPage.login(
            config.getTestStudentEmail(),
            config.getTestStudentPassword()
        );
        
        Assert.assertTrue(dashboardPage.isLoggedIn(), "User should be logged in");
        
        dashboardPage.logout();
        
        // Should redirect to login page
        LoginPage loginPageAfterLogout = new LoginPage(driver);
        Assert.assertTrue(loginPageAfterLogout.isPageLoaded(), "Should return to login page after logout");
    }

    @Test(description = "Verify session persistence after page refresh")
    public void testSessionPersistence() {
        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboardPage = loginPage.login(
            config.getTestStudentEmail(),
            config.getTestStudentPassword()
        );
        
        refreshPage();
        
        Assert.assertTrue(dashboardPage.isLoggedIn(), "User should still be logged in after refresh");
    }

    @Test(description = "Verify forgot password link is displayed")
    public void testForgotPasswordLink() {
        LoginPage loginPage = new LoginPage(driver);
        
        // Check if forgot password link is present
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector("a[href='/forgot-password']")
        ), "Forgot password link should be displayed");
    }

    @Test(description = "Verify register link is displayed")
    public void testRegisterLink() {
        LoginPage loginPage = new LoginPage(driver);
        
        // Check if register link is present
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector("a[href='/register']")
        ), "Register link should be displayed");
    }
}
