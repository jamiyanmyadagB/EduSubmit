# EduSubmit E2E Selenium Tests

This module contains end-to-end (E2E) automation tests for the EduSubmit platform using Selenium WebDriver and TestNG.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Test Configuration](#test-configuration)
- [Page Object Model](#page-object-model)
- [Test Reporting](#test-reporting)
- [CI/CD Integration](#cicd-integration)
- [Debugging Failed Tests](#debugging-failed-tests)
- [Best Practices](#best-practices)

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- Node.js 18+ (for running the frontend)
- Chrome/Firefox browser
- IDE (IntelliJ IDEA or Eclipse with TestNG plugin)

## Project Structure

```
backend/e2e-tests/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/edusubmit/e2e/
│   │           ├── config/           # Configuration classes
│   │           │   ├── ConfigReader.java
│   │           │   └── WebDriverFactory.java
│   │           ├── base/             # Base test class
│   │           │   └── BaseTest.java
│   │           ├── pages/            # Page Object Model classes
│   │           │   ├── BasePage.java
│   │           │   ├── LoginPage.java
│   │           │   ├── DashboardPage.java
│   │           │   ├── StudentDashboardPage.java
│   │           │   ├── FacultyDashboardPage.java
│   │           │   └── AdminDashboardPage.java
│   │           ├── utils/            # Utility classes
│   │           │   ├── WebDriverUtils.java
│   │           │   └── ScreenshotUtils.java
│   │           └── listeners/        # TestNG listeners
│   │               ├── TestListener.java
│   │               └── ExtentReportListener.java
│   └── test/
│       ├── java/
│       │   └── com/edusubmit/e2e/
│       │       └── tests/            # Test classes
│       │           ├── AuthenticationTest.java
│       │           ├── StudentDashboardTest.java
│       │           ├── FacultyDashboardTest.java
│       │           └── AdminDashboardTest.java
│       └── resources/
│           ├── config.properties      # Test configuration
│           ├── testng.xml            # TestNG suite configuration
│           └── log4j2.xml            # Logging configuration
├── pom.xml                           # Maven dependencies
└── README.md                         # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project6thSem
```

### 2. Build the Project

```bash
# Build backend
cd backend
mvn clean install

# Build frontend
cd ../frontend
npm install
npm run build
```

### 3. Configure Test Environment

Edit `backend/e2e-tests/src/test/resources/config.properties`:

```properties
# Browser Configuration
browser=chrome
headless=false

# Environment Configuration
environment=dev
base.url=http://localhost:3000

# Test User Credentials
test.user.student.email=student.test@lpu.in
test.user.student.password=Test@12345
test.user.teacher.email=teacher.test@lpu.in
test.user.teacher.password=Test@12345
test.user.admin.email=admin.test@lpu.in
test.user.admin.password=Admin@12345
```

### 4. Start the Application

```bash
# Terminal 1: Start backend services
cd backend
mvn spring-boot:run

# Terminal 2: Start frontend
cd frontend
npm start
```

## Running Tests

### Run All Tests

```bash
cd backend/e2e-tests
mvn clean test
```

### Run Specific Test Suite

```bash
# Run authentication tests only
mvn test -Dtest=AuthenticationTest

# Run student dashboard tests only
mvn test -Dtest=StudentDashboardTest

# Run faculty dashboard tests only
mvn test -Dtest=FacultyDashboardTest

# Run admin dashboard tests only
mvn test -Dtest=AdminDashboardTest
```

### Run Tests with Different Browsers

```bash
# Run with Chrome
mvn test -Pchrome

# Run with Firefox
mvn test -Pfirefox

# Run with Edge
mvn test -Dbrowser=edge
```

### Run Tests in Headless Mode

```bash
mvn test -Pheadless
```

### Run Tests for Different Environments

```bash
# Development environment
mvn test -Pdev

# Staging environment
mvn test -Pstaging

# Production environment
mvn test -Pprod
```

## Test Configuration

### Browser Options

- **browser**: Browser to use (chrome, firefox, edge, safari)
- **headless**: Run browser in headless mode (true/false)
- **browser.width**: Browser window width (default: 1920)
- **browser.height**: Browser window height (default: 1080)

### Environment Options

- **environment**: Environment to test against (dev, staging, prod)
- **base.url**: Base URL of the application
- **api.url**: API base URL

### Timeout Options

- **implicit.wait**: Implicit wait timeout in seconds (default: 10)
- **explicit.wait**: Explicit wait timeout in seconds (default: 30)
- **page.load.timeout**: Page load timeout in seconds (default: 30)

### Screenshot Options

- **screenshot.on.failure**: Capture screenshot on test failure (true/false)
- **screenshot.directory**: Directory to save screenshots (default: target/screenshots)

## Page Object Model

The test suite uses the Page Object Model (POM) design pattern for better maintainability and reusability.

### BasePage

All page objects extend `BasePage` which provides common functionality:
- Navigation methods
- Common element locators
- Page loading verification

### Page Classes

- **LoginPage**: Login page elements and actions
- **DashboardPage**: Base dashboard functionality
- **StudentDashboardPage**: Student-specific dashboard features
- **FacultyDashboardPage**: Faculty-specific dashboard features
- **AdminDashboardPage**: Admin-specific dashboard features

### Example Usage

```java
LoginPage loginPage = new LoginPage(driver);
DashboardPage dashboardPage = loginPage.login(email, password);
Assert.assertTrue(dashboardPage.isPageLoaded());
```

## Test Reporting

### ExtentReports

The test suite uses ExtentReports for generating HTML test reports with:
- Test execution summary
- Screenshots on failure
- Test duration
- Step-by-step test logs

Reports are generated in: `target/extent-reports/`

### Console Output

Test execution logs are printed to console and saved to: `target/test-logs/e2e-tests.log`

### Viewing Reports

1. After test execution, open `target/extent-reports/EduSubmit_E2E_Report_<timestamp>.html`
2. View detailed test results, screenshots, and logs

## CI/CD Integration

The test suite is integrated with GitHub Actions for automated testing.

### Workflow Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

### Workflow Steps

1. Checkout code
2. Set up JDK 17
3. Set up Node.js
4. Build frontend
5. Start frontend server
6. Set up browser drivers
7. Run E2E tests
8. Upload test reports and screenshots

### Workflow Configuration

Located at: `.github/workflows/e2e-tests.yml`

## Debugging Failed Tests

### 1. Check Screenshots

Failed tests automatically capture screenshots in `target/screenshots/`

### 2. Check Test Logs

Detailed logs are available in `target/test-logs/e2e-tests.log`

### 3. Run Tests in Debug Mode

```bash
# Run with verbose output
mvn test -X

# Run specific test with debug
mvn test -Dtest=AuthenticationTest#testSuccessfulLogin
```

### 4. Use Browser DevTools

Set `headless=false` in config.properties to watch test execution in real-time.

### 5. Add Breakpoints

Add breakpoints in your IDE and run tests in debug mode.

## Best Practices

### 1. Use Explicit Waits

Always use explicit waits instead of Thread.sleep():

```java
// Good
WebElement element = webDriverUtils.waitForVisibility(locator);

// Bad
Thread.sleep(5000);
```

### 2. Use Stable Selectors

Prefer CSS selectors over XPath when possible:
- Use data attributes: `[data-testid="submit-button"]`
- Use unique IDs: `#login-button`
- Avoid complex XPath expressions

### 3. Keep Tests Independent

Each test should be able to run independently:
- Clean up after each test
- Don't depend on test execution order
- Use fresh browser session for each test

### 4. Use Descriptive Test Names

```java
@Test(description = "Verify successful login with valid credentials")
public void testSuccessfulLogin() {
    // Test implementation
}
```

### 5. Group Related Tests

Use TestNG groups to organize tests:

```java
@Test(groups = {"authentication", "smoke"})
public void testLogin() {
    // Test implementation
}
```

### 6. Handle Dynamic Elements

Use flexible selectors for dynamic elements:
- Use contains: `//*[contains(text(), 'Submit')]`
- Use starts-with: `//*[starts-with(@id, 'user-')]`
- Use CSS partial matches: `[class*='btn-']`

### 7. Maintain Test Data

Keep test data separate from test logic:
- Use config.properties for configuration
- Use test data files for complex test data
- Consider using data providers for parameterized tests

### 8. Regular Maintenance

- Update selectors when UI changes
- Review and update test cases regularly
- Remove obsolete tests
- Add new tests for new features

## Troubleshooting

### Issue: WebDriver not found

**Solution**: WebDriverManager automatically downloads drivers. Ensure internet connectivity.

### Issue: Element not found

**Solution**: 
- Check if element is in iframe
- Verify selector is correct
- Add explicit wait
- Check if element is hidden behind loading spinner

### Issue: Tests timing out

**Solution**:
- Increase timeout in config.properties
- Optimize test execution
- Check network latency
- Verify application performance

### Issue: Browser not launching in CI

**Solution**:
- Ensure headless mode is enabled
- Check browser compatibility
- Verify display settings in CI environment

## Contributing

When adding new tests:

1. Create/update Page Object Model classes
2. Add test methods to appropriate test class
3. Use descriptive test names and descriptions
4. Add proper assertions
5. Test locally before committing
6. Update this README if needed

## Support

For issues or questions:
1. Check this README
2. Review test logs
3. Check screenshots
4. Contact the QA team
