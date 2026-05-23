package com.edusubmit.e2e.listeners;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * ExtentReports listener for generating HTML test reports
 */
public class ExtentReportListener implements ITestListener {
    private static ExtentReports extent;
    private static ThreadLocal<ExtentTest> extentTest = new ThreadLocal<>();

    @Override
    public void onStart(ITestContext context) {
        // Initialize ExtentReports
        extent = new ExtentReports();
        
        // Create report directory
        String reportPath = "target/extent-reports";
        File reportDir = new File(reportPath);
        if (!reportDir.exists()) {
            reportDir.mkdirs();
        }

        // Configure Spark reporter
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String reportFileName = "EduSubmit_E2E_Report_" + timestamp + ".html";
        ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath + File.separator + reportFileName);
        
        sparkReporter.config().setDocumentTitle("EduSubmit E2E Test Report");
        sparkReporter.config().setReportName("EduSubmit End-to-End Automation Test Results");
        sparkReporter.config().setTheme(Theme.STANDARD);
        sparkReporter.config().setEncoding("UTF-8");
        
        extent.attachReporter(sparkReporter);
        
        // Add system information
        extent.setSystemInfo("Application", "EduSubmit");
        extent.setSystemInfo("Environment", System.getProperty("environment", "dev"));
        extent.setSystemInfo("Browser", System.getProperty("browser", "chrome"));
        extent.setSystemInfo("Headless", System.getProperty("headless", "false"));
        extent.setSystemInfo("OS", System.getProperty("os.name"));
        extent.setSystemInfo("Java Version", System.getProperty("java.version"));
        extent.setSystemInfo("User", System.getProperty("user.name"));
    }

    @Override
    public void onTestStart(ITestResult result) {
        // Create test node
        ExtentTest test = extent.createTest(result.getMethod().getMethodName());
        extentTest.set(test);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        ExtentTest test = extentTest.get();
        test.pass("Test passed successfully");
        
        // Add test duration
        long duration = result.getEndMillis() - result.getStartMillis();
        test.info("Test duration: " + duration + " ms");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        ExtentTest test = extentTest.get();
        test.fail("Test failed");
        
        // Add error message and stack trace
        if (result.getThrowable() != null) {
            test.fail(result.getThrowable());
        }
        
        // Add screenshot if available
        String screenshotPath = (String) result.getAttribute("screenshotPath");
        if (screenshotPath != null) {
            try {
                test.fail("Screenshot", MediaEntityBuilder.createScreenCaptureFromPath(screenshotPath).build());
            } catch (Exception e) {
                test.info("Failed to attach screenshot: " + e.getMessage());
            }
        }
        
        // Add test duration
        long duration = result.getEndMillis() - result.getStartMillis();
        test.info("Test duration: " + duration + " ms");
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        ExtentTest test = extentTest.get();
        test.skip("Test skipped");
        
        if (result.getThrowable() != null) {
            test.skip(result.getThrowable());
        }
    }

    @Override
    public void onFinish(ITestContext context) {
        // Flush the report
        extent.flush();
    }
}
