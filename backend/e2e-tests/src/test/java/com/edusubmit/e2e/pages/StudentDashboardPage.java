package com.edusubmit.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object Model for Student Dashboard
 */
public class StudentDashboardPage extends DashboardPage {
    // Student-specific elements
    @FindBy(css = ".student-dashboard")
    private WebElement studentDashboard;

    @FindBy(css = ".assignment-card")
    private WebElement assignmentCard;

    @FindBy(css = ".submission-status")
    private WebElement submissionStatus;

    @FindBy(css = ".ai-assistant-button")
    private WebElement aiAssistantButton;

    @FindBy(css = ".exam-timetable")
    private WebElement examTimetable;

    @FindBy(css = ".grade-report")
    private WebElement gradeReport;

    @FindBy(css = ".upload-submission-button")
    private WebElement uploadSubmissionButton;

    @FindBy(css = ".view-assignment-button")
    private WebElement viewAssignmentButton;

    public StudentDashboardPage(WebDriver driver) {
        super(driver);
    }

    @Override
    public boolean isPageLoaded() {
        return webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector(".student-dashboard"));
    }

    /**
     * Click on assignment card
     */
    public void clickAssignmentCard() {
        assignmentCard.click();
    }

    /**
     * Get submission status
     */
    public String getSubmissionStatus() {
        return submissionStatus.getText();
    }

    /**
     * Open AI Assistant
     */
    public void openAIAssistant() {
        aiAssistantButton.click();
    }

    /**
     * View exam timetable
     */
    public void viewExamTimetable() {
        examTimetable.click();
    }

    /**
     * View grade report
     */
    public void viewGradeReport() {
        gradeReport.click();
    }

    /**
     * Upload submission
     */
    public void uploadSubmission() {
        uploadSubmissionButton.click();
    }

    /**
     * View assignment details
     */
    public void viewAssignment() {
        viewAssignmentButton.click();
    }

    /**
     * Check if assignment card is displayed
     */
    public boolean isAssignmentCardDisplayed() {
        return assignmentCard.isDisplayed();
    }

    /**
     * Check if AI Assistant button is displayed
     */
    public boolean isAIAssistantButtonDisplayed() {
        return aiAssistantButton.isDisplayed();
    }
}
