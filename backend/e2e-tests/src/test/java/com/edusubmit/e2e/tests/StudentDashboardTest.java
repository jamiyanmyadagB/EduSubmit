package com.edusubmit.e2e.tests;

import com.edusubmit.e2e.base.BaseTest;
import com.edusubmit.e2e.config.ConfigReader;
import com.edusubmit.e2e.pages.LoginPage;
import com.edusubmit.e2e.pages.StudentDashboardPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * E2E tests for Student Dashboard
 */
public class StudentDashboardTest extends BaseTest {
    private StudentDashboardPage studentDashboard;

    @BeforeMethod(alwaysRun = true)
    public void loginAsStudent() {
        // Login as student
        LoginPage loginPage = new LoginPage(driver);
        studentDashboard = (StudentDashboardPage) loginPage.login(
            config.getTestStudentEmail(),
            config.getTestStudentPassword(),
            "STUDENT"
        );
    }

    @Test(description = "Verify student dashboard is displayed")
    public void testStudentDashboardDisplay() {
        Assert.assertTrue(studentDashboard.isPageLoaded(), "Student dashboard should be loaded");
        Assert.assertTrue(studentDashboard.isSidebarDisplayed(), "Sidebar should be displayed");
        Assert.assertTrue(studentDashboard.isStatsCardDisplayed(), "Stats card should be displayed");
    }

    @Test(description = "Verify welcome message is displayed")
    public void testWelcomeMessage() {
        String welcomeMessage = studentDashboard.getWelcomeMessage();
        Assert.assertNotNull(welcomeMessage, "Welcome message should be displayed");
        Assert.assertTrue(welcomeMessage.length() > 0, "Welcome message should not be empty");
    }

    @Test(description = "Verify assignment cards are displayed")
    public void testAssignmentCardsDisplay() {
        Assert.assertTrue(studentDashboard.isAssignmentCardDisplayed(), "Assignment cards should be displayed");
    }

    @Test(description = "Verify AI Assistant button is displayed")
    public void testAIAssistantButton() {
        Assert.assertTrue(studentDashboard.isAIAssistantButtonDisplayed(), "AI Assistant button should be displayed");
    }

    @Test(description = "Verify navigation to assignments")
    public void testNavigateToAssignments() {
        studentDashboard.navigateToAssignments();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("assignments"), "Should navigate to assignments page");
    }

    @Test(description = "Verify navigation to submissions")
    public void testNavigateToSubmissions() {
        studentDashboard.navigateToSubmissions();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("submissions"), "Should navigate to submissions page");
    }

    @Test(description = "Verify navigation to notifications")
    public void testNavigateToNotifications() {
        studentDashboard.navigateToNotifications();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("notifications"), "Should navigate to notifications page");
    }

    @Test(description = "Verify navigation to profile")
    public void testNavigateToProfile() {
        studentDashboard.navigateToProfile();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("profile"), "Should navigate to profile page");
    }

    @Test(description = "Verify view assignment functionality")
    public void testViewAssignment() {
        studentDashboard.viewAssignment();
        
        // Should open assignment details
        webDriverUtils.waitForPageLoad();
        Assert.assertTrue(driver.getCurrentUrl().contains("assignment"), "Should navigate to assignment details");
    }

    @Test(description = "Verify submission status is displayed")
    public void testSubmissionStatus() {
        String status = studentDashboard.getSubmissionStatus();
        Assert.assertNotNull(status, "Submission status should be displayed");
    }

    @Test(description = "Verify exam timetable access")
    public void testExamTimetable() {
        studentDashboard.viewExamTimetable();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("exam") || driver.getCurrentUrl().contains("timetable"), 
            "Should navigate to exam timetable");
    }

    @Test(description = "Verify grade report access")
    public void testGradeReport() {
        studentDashboard.viewGradeReport();
        
        Assert.assertTrue(driver.getCurrentUrl().contains("grade") || driver.getCurrentUrl().contains("report"), 
            "Should navigate to grade report");
    }

    @Test(description = "Verify recent activity is displayed")
    public void testRecentActivity() {
        Assert.assertTrue(studentDashboard.isRecentActivityDisplayed(), "Recent activity should be displayed");
    }
}
