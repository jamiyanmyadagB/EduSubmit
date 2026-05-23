package com.edusubmit.e2e.utils;

import com.edusubmit.e2e.config.ConfigReader;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;
import java.util.List;
import java.util.function.Function;

/**
 * Utility class for common WebDriver operations
 */
public class WebDriverUtils {
    private final WebDriver driver;
    private final ConfigReader config;

    public WebDriverUtils(WebDriver driver) {
        this.driver = driver;
        this.config = ConfigReader.getInstance();
    }

    /**
     * Wait for element to be visible
     */
    public WebElement waitForVisibility(By locator) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getExplicitWait()));
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    /**
     * Wait for element to be clickable
     */
    public WebElement waitForClickable(By locator) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getExplicitWait()));
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    /**
     * Wait for element to be present in DOM
     */
    public WebElement waitForPresence(By locator) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getExplicitWait()));
        return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    /**
     * Wait for element to be invisible
     */
    public boolean waitForInvisibility(By locator) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getExplicitWait()));
        return wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    /**
     * Wait for custom condition
     */
    public <T> T waitFor(Function<WebDriver, T> condition) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getExplicitWait()));
        return wait.until(condition);
    }

    /**
     * Wait for page to load completely
     */
    public void waitForPageLoad() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getPageLoadTimeout()));
        wait.until(webDriver -> ((JavascriptExecutor) webDriver)
                .executeScript("return document.readyState").equals("complete"));
    }

    /**
     * Wait for AJAX calls to complete
     */
    public void waitForAjaxComplete() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(config.getExplicitWait()));
        wait.until(webDriver -> ((JavascriptExecutor) webDriver)
                .executeScript("return jQuery.active == 0"));
    }

    /**
     * Scroll to element
     */
    public void scrollToElement(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);
    }

    /**
     * Scroll to top of page
     */
    public void scrollToTop() {
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
    }

    /**
     * Scroll to bottom of page
     */
    public void scrollToBottom() {
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
    }

    /**
     * Click element using JavaScript
     */
    public void clickWithJS(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    /**
     * Hover over element
     */
    public void hoverOverElement(WebElement element) {
        Actions actions = new Actions(driver);
        actions.moveToElement(element).perform();
    }

    /**
     * Double click on element
     */
    public void doubleClick(WebElement element) {
        Actions actions = new Actions(driver);
        actions.doubleClick(element).perform();
    }

    /**
     * Right click on element
     */
    public void rightClick(WebElement element) {
        Actions actions = new Actions(driver);
        actions.contextClick(element).perform();
    }

    /**
     * Switch to iframe by index
     */
    public void switchToFrame(int index) {
        driver.switchTo().frame(index);
    }

    /**
     * Switch to iframe by name or ID
     */
    public void switchToFrame(String nameOrId) {
        driver.switchTo().frame(nameOrId);
    }

    /**
     * Switch to iframe by WebElement
     */
    public void switchToFrame(WebElement frameElement) {
        driver.switchTo().frame(frameElement);
    }

    /**
     * Switch back to default content
     */
    public void switchToDefaultContent() {
        driver.switchTo().defaultContent();
    }

    /**
     * Switch to new tab/window
     */
    public void switchToNewTab() {
        String originalWindow = driver.getWindowHandle();
        for (String windowHandle : driver.getWindowHandles()) {
            if (!windowHandle.equals(originalWindow)) {
                driver.switchTo().window(windowHandle);
                break;
            }
        }
    }

    /**
     * Switch to original tab/window
     */
    public void switchToOriginalTab(String originalWindow) {
        driver.switchTo().window(originalWindow);
    }

    /**
     * Close current tab and switch to original
     */
    public void closeTabAndSwitchBack(String originalWindow) {
        driver.close();
        driver.switchTo().window(originalWindow);
    }

    /**
     * Get all window handles
     */
    public List<String> getAllWindowHandles() {
        return List.copyOf(driver.getWindowHandles());
    }

    /**
     * Take screenshot
     */
    public byte[] takeScreenshot() {
        return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
    }

    /**
     * Highlight element (for debugging)
     */
    public void highlightElement(WebElement element) {
        String originalStyle = element.getAttribute("style");
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("arguments[0].setAttribute('style', 'border: 3px solid red; background: yellow;')", element);
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        js.executeScript("arguments[0].setAttribute('style', '" + originalStyle + "')", element);
    }

    /**
     * Check if element is displayed
     */
    public boolean isElementDisplayed(By locator) {
        try {
            return driver.findElement(locator).isDisplayed();
        } catch (NoSuchElementException | StaleElementReferenceException e) {
            return false;
        }
    }

    /**
     * Check if element is enabled
     */
    public boolean isElementEnabled(By locator) {
        try {
            return driver.findElement(locator).isEnabled();
        } catch (NoSuchElementException | StaleElementReferenceException e) {
            return false;
        }
    }

    /**
     * Check if element is selected
     */
    public boolean isElementSelected(By locator) {
        try {
            return driver.findElement(locator).isSelected();
        } catch (NoSuchElementException | StaleElementReferenceException e) {
            return false;
        }
    }

    /**
     * Get text from element with wait
     */
    public String getText(By locator) {
        WebElement element = waitForVisibility(locator);
        return element.getText();
    }

    /**
     * Get attribute value with wait
     */
    public String getAttribute(By locator, String attributeName) {
        WebElement element = waitForPresence(locator);
        return element.getAttribute(attributeName);
    }

    /**
     * Clear and send keys to element
     */
    public void clearAndSendKeys(By locator, String text) {
        WebElement element = waitForVisibility(locator);
        element.clear();
        element.sendKeys(text);
    }

    /**
     * Click element with wait
     */
    public void click(By locator) {
        WebElement element = waitForClickable(locator);
        element.click();
    }

    /**
     * Select dropdown option by visible text
     */
    public void selectByVisibleText(By locator, String text) {
        WebElement element = waitForVisibility(locator);
        Select select = new Select(element);
        select.selectByVisibleText(text);
    }

    /**
     * Select dropdown option by value
     */
    public void selectByValue(By locator, String value) {
        WebElement element = waitForVisibility(locator);
        Select select = new Select(element);
        select.selectByValue(value);
    }

    /**
     * Select dropdown option by index
     */
    public void selectByIndex(By locator, int index) {
        WebElement element = waitForVisibility(locator);
        Select select = new Select(element);
        select.selectByIndex(index);
    }

    /**
     * Get selected option text
     */
    public String getSelectedOptionText(By locator) {
        WebElement element = waitForVisibility(locator);
        Select select = new Select(element);
        return select.getFirstSelectedOption().getText();
    }
}
