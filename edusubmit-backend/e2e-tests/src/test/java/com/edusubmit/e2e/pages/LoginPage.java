package com.edusubmit.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object Model for Login Page
 */
public class LoginPage extends BasePage {
    // Page elements
    @FindBy(css = "input[name='email']")
    private WebElement emailInput;

    @FindBy(css = "input[name='password']")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;

    @FindBy(css = ".error-message")
    private WebElement errorMessage;

    @FindBy(css = "select[name='role']")
    private WebElement roleSelect;

    @FindBy(css = "a[href='/forgot-password']")
    private WebElement forgotPasswordLink;

    @FindBy(css = "a[href='/register']")
    private WebElement registerLink;

    @FindBy(css = ".login-container")
    private WebElement loginContainer;

    @FindBy(css = "h1")
    private WebElement pageTitle;

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    @Override
    public boolean isPageLoaded() {
        return webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector("input[name='email']"));
    }

    /**
     * Enter email
     */
    public LoginPage enterEmail(String email) {
        webDriverUtils.clearAndSendKeys(org.openqa.selenium.By.cssSelector("input[name='email']"), email);
        return this;
    }

    /**
     * Enter password
     */
    public LoginPage enterPassword(String password) {
        webDriverUtils.clearAndSendKeys(org.openqa.selenium.By.cssSelector("input[name='password']"), password);
        return this;
    }

    /**
     * Select role
     */
    public LoginPage selectRole(String role) {
        webDriverUtils.selectByVisibleText(org.openqa.selenium.By.cssSelector("select[name='role']"), role);
        return this;
    }

    /**
     * Click login button
     */
    public void clickLogin() {
        webDriverUtils.click(org.openqa.selenium.By.cssSelector("button[type='submit']"));
    }

    /**
     * Perform login with email and password
     */
    public DashboardPage login(String email, String password) {
        enterEmail(email)
            .enterPassword(password)
            .clickLogin();
        return new DashboardPage(driver);
    }

    /**
     * Perform login with email, password, and role
     */
    public DashboardPage login(String email, String password, String role) {
        enterEmail(email)
            .enterPassword(password)
            .selectRole(role)
            .clickLogin();
        return new DashboardPage(driver);
    }

    /**
     * Get error message
     */
    public String getErrorMessage() {
        if (webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector(".error-message"))) {
            return errorMessage.getText();
        }
        return null;
    }

    /**
     * Check if error message is displayed
     */
    public boolean isErrorMessageDisplayed() {
        return webDriverUtils.isElementDisplayed(org.openqa.selenium.By.cssSelector(".error-message"));
    }

    /**
     * Click forgot password link
     */
    public void clickForgotPassword() {
        forgotPasswordLink.click();
    }

    /**
     * Click register link
     */
    public void clickRegister() {
        registerLink.click();
    }

    /**
     * Get page title text
     */
    public String getPageTitleText() {
        try {
            return driver.findElement(org.openqa.selenium.By.cssSelector(".gradient-text")).getText();
        } catch (Exception e) {
            return pageTitle.getText();
        }
    }
}
