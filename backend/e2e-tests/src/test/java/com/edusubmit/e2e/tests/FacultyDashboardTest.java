package com.edusubmit.e2e.tests;

import com.edusubmit.e2e.base.BaseTest;
import com.edusubmit.e2e.config.ConfigReader;
import com.edusubmit.e2e.pages.FacultyDashboardPage;
import com.edusubmit.e2e.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * E2E tests for Faculty Dashboard
 */
public class FacultyDashboardTest extends BaseTest {
    private FacultyDashboardPage facultyDashboard;

    @BeforeMethod(alwaysRun = true)
    public void loginAsTeacher() {
        // Login as teacher
        LoginPage loginPage = new LoginPage(driver);
        facultyDashboard = (FacultyDashboardPage) loginPage.login(
            config.getTestTeacherEmail(),
            config.getTestTeacherPassword(),
            "TEACHER"
        );
    }

    @Test(description = "Verify faculty dashboard is displayed")
    public void testFacultyDashboardDisplay() {
        Assert.assertTrue(facultyDashboard.isPageLoaded(), "Faculty dashboard should be loaded");
        Assert.assertTrue(facultyDashboard.isSidebarDisplayed(), "Sidebar should be displayed");
        Assert.assertTrue(facultyDashboard.isStatsCardDisplayed(), "Stats card should be displayed");
    }

    @Test(description = "Verify create assignment button is displayed")
    public void testCreateAssignmentButton() {
        Assert.assertTrue(facultyDashboard.isCreateAssignmentButtonDisplayed(), "Create assignment button should be displayed");
    }

    @Test(description = "Verify student list is displayed")
    public void testStudentListDisplay() {
        Assert.assertTrue(facultyDashboard.isStudentListDisplayed(), "Student list should be displayed");
    }

    @Test(description = "Verify assignment list is displayed")
    public void testAssignmentListDisplay() {
        Assert.assertTrue(facultyDashboard.isAssignmentListDisplayed(), "Assignment list should be displayed");
    }

    @Test(description = "Verify create assignment functionality")
    public void testCreateAssignment() {
        facultyDashboard.clickCreateAssignment();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("create") || driver.getCurrentUrl().contains("assignment"), 
            "Should navigate to create assignment page");
    }

    @Test(description = "Verify view submissions functionality")
    public void testViewSubmissions() {
        facultyDashboard.viewSubmissions();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("submission"), "Should navigate to submissions page");
    }

    @Test(description = "Verify grade submission functionality")
    public void testGradeSubmission() {
        facultyDashboard.gradeSubmission();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("grade"), "Should navigate to grading page");
    }

    @Test(description = "Verify upload resource functionality")
    public void testUploadResource() {
        facultyDashboard.uploadResource();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("resource") || driver.getCurrentUrl().contains("upload"), 
            "Should navigate to resource upload page");
    }

    @Test(description = "Verify publish exam functionality")
    public void testPublishExam() {
        facultyDashboard.publishExam();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("exam") || driver.getCurrentUrl().contains("publish"), 
            "Should navigate to exam publishing page");
    }

    @Test(description = "Verify send announcement functionality")
    public void testSendAnnouncement() {
        facultyDashboard.sendAnnouncement();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("announcement"), "Should navigate to announcement page");
    }

    @Test(description = "Verify edit assignment functionality")
    public void testEditAssignment() {
        facultyDashboard.clickEditAssignment();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("edit") || driver.getCurrentUrl().contains("assignment"), 
            "Should navigate to edit assignment page");
    }

    @Test(description = "Verify delete assignment functionality")
    public void testDeleteAssignment() {
        facultyDashboard.clickDeleteAssignment();
        
        // Should show confirmation dialog
        webDriverUtils.waitForPageLoad();
        Assert.assertTrue(webDriverUtils.isElementDisplayed(
            org.openqa.selenium.By.cssSelector(".confirm-dialog")
        ), "Confirmation dialog should be displayed");
    }

    @Test(description = "Verify welcome message is displayed")
    public void testWelcomeMessage() {
        String welcomeMessage = facultyDashboard.getWelcomeMessage();
        Assert.assertNotNull(welcomeMessage, "Welcome message should be displayed");
        Assert.assertTrue(welcomeMessage.length() > 0, "Welcome message should not be empty");
    }

    @Test(description = "Verify recent activity is displayed")
    public void testRecentActivity() {
        Assert.assertTrue(facultyDashboard.isRecentActivityDisplayed(), "Recent activity should be displayed");
    }
}
