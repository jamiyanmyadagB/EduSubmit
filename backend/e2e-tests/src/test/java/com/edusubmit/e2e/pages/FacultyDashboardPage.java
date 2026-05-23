package com.edusubmit.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object Model for Faculty Dashboard
 */
public class FacultyDashboardPage extends DashboardPage {
    // Faculty-specific elements
    @FindBy(css = ".faculty-dashboard")
    private WebElement facultyDashboard;

    @FindBy(css = ".create-assignment-button")
    private WebElement createAssignmentButton;

    @FindBy(css = ".edit-assignment-button")
    private WebElement editAssignmentButton;

    @FindBy(css = ".delete-assignment-button")
    private WebElement deleteAssignmentButton;

    @FindBy(css = ".view-submissions-button")
    private WebElement viewSubmissionsButton;

    @FindBy(css = ".grade-submission-button")
    private WebElement gradeSubmissionButton;

    @FindBy(css = ".upload-resource-button")
    private WebElement uploadResourceButton;

    @FindBy(css = ".publish-exam-button")
    private WebElement publishExamButton;

    @FindBy(css = ".send-announcement-button")
    private WebElement sendAnnouncementButton;

    @FindBy(css = ".student-list")
    private WebElement studentList;

    @FindBy(css = ".assignment-list")
    private WebElement assignmentList;

    public FacultyDashboardPage(WebDriver driver) {
        super(driver);
    }

    @Override
    public boolean isPageLoaded() {
        return webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector(".faculty-dashboard"));
    }

    /**
     * Click create assignment button
     */
    public void clickCreateAssignment() {
        createAssignmentButton.click();
    }

    /**
     * Click edit assignment button
     */
    public void clickEditAssignment() {
        editAssignmentButton.click();
    }

    /**
     * Click delete assignment button
     */
    public void clickDeleteAssignment() {
        deleteAssignmentButton.click();
    }

    /**
     * View submissions
     */
    public void viewSubmissions() {
        viewSubmissionsButton.click();
    }

    /**
     * Grade submission
     */
    public void gradeSubmission() {
        gradeSubmissionButton.click();
    }

    /**
     * Upload resource
     */
    public void uploadResource() {
        uploadResourceButton.click();
    }

    /**
     * Publish exam schedule
     */
    public void publishExam() {
        publishExamButton.click();
    }

    /**
     * Send announcement
     */
    public void sendAnnouncement() {
        sendAnnouncementButton.click();
    }

    /**
     * Check if student list is displayed
     */
    public boolean isStudentListDisplayed() {
        return studentList.isDisplayed();
    }

    /**
     * Check if assignment list is displayed
     */
    public boolean isAssignmentListDisplayed() {
        return assignmentList.isDisplayed();
    }

    /**
     * Check if create assignment button is displayed
     */
    public boolean isCreateAssignmentButtonDisplayed() {
        return createAssignmentButton.isDisplayed();
    }
}
