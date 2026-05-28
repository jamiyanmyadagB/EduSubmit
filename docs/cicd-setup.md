# EduSubmit CI/CD Setup Guide

Complete guide for setting up and configuring the EduSubmit CI/CD pipeline using GitHub Actions.

## Table of Contents
1. [Overview](#overview)
2. [Required GitHub Secrets](#required-github-secrets)
3. [Workflow Files](#workflow-files)
4. [Setup Instructions](#setup-instructions)
5. [Workflow Triggers](#workflow-triggers)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

EduSubmit uses GitHub Actions for continuous integration, continuous deployment, security scanning, and automated testing. The CI/CD pipeline consists of the following workflows:

- **ci.yml**: Main CI/CD pipeline with build, test, code quality, security scan, Docker build, and deployment
- **deploy.yml**: Deployment workflow for staging, production, and AWS EC2
- **security-scan.yml**: Comprehensive security scanning with Snyk, Trivy, CodeQL, and OWASP
- **e2e-tests.yml**: End-to-end Selenium tests for Chrome and Firefox

---

## Required GitHub Secrets

Configure the following secrets in your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

### Docker Registry Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `your-dockerhub-username` |
| `DOCKER_PASSWORD` | Docker Hub password or access token | `dckr_pat_xxxxxxxx` |

### Code Quality Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SONAR_TOKEN` | SonarQube authentication token | `squ_xxxxxxxx` |

### Security Scanning Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SNYK_TOKEN` | Snyk authentication token | `xxxx-xxxx-xxxx-xxxx` |

### AWS Secrets (for AWS deployment)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | `us-east-1` |

### EC2 Secrets (for AWS EC2 deployment)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `EC2_HOST` | EC2 instance public IP or hostname | `ec2-xx-xx-xx-xx.compute.amazonaws.com` |
| `EC2_USERNAME` | EC2 SSH username | `ubuntu` |
| `EC2_SSH_KEY` | EC2 SSH private key (base64 encoded) | `LS0tLS1CRUdJTi...` |

### Kubernetes Secrets (for Kubernetes deployment)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `KUBE_CONFIG_STAGING` | Kubernetes config for staging (base64 encoded) | `apiVersion: v1...` |
| `KUBE_CONFIG_PRODUCTION` | Kubernetes config for production (base64 encoded) | `apiVersion: v1...` |

### How to Base64 Encode Secrets

For secrets that require base64 encoding:

```bash
# On Linux/Mac
base64 -i kubeconfig-staging.txt

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("kubeconfig-staging.txt"))

# For SSH key
base64 -i ~/.ssh/id_rsa
```

---

## Workflow Files

### 1. ci.yml - Main CI/CD Pipeline

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs**:
1. **backend-unit-tests**: Runs JUnit 5 unit tests for backend
2. **backend-integration-tests**: Runs Spring Boot integration tests
3. **frontend-unit-tests**: Runs Jest tests for frontend
4. **sonarqube**: Runs SonarQube code quality analysis (requires SONAR_TOKEN)
5. **snyk-scan**: Scans dependencies for vulnerabilities (requires SNYK_TOKEN)
6. **docker-build**: Builds and pushes Docker images (only on main/develop)
7. **trivy-scan**: Scans Docker images for vulnerabilities
8. **deploy-aws**: Deploys to AWS EC2 (only on main, requires AWS secrets)

**Key Features**:
- Parallel execution of unit and integration tests
- Maven and npm caching for faster builds
- Artifact upload for test results and coverage reports
- Docker multi-platform builds with GitHub Actions cache
- Trivy SARIF upload to GitHub Security tab

### 2. deploy.yml - Deployment Workflow

**Triggers**:
- Push to `main` branch (auto-deploys to staging)
- Manual workflow dispatch (can choose staging, production, or aws-ec2)

**Jobs**:
1. **deploy-staging**: Deploys to Kubernetes staging environment
2. **deploy-production**: Deploys to Kubernetes production environment (manual only)
3. **deploy-aws-ec2**: Deploys to AWS EC2 using SSH and docker-compose

**Key Features**:
- Kubernetes deployment with kubectl
- Automatic image tag updates using git SHA
- Rollout status verification
- Health checks after deployment
- Deployment status notifications

### 3. security-scan.yml - Security Scanning

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Daily schedule at 2 AM UTC
- Manual workflow dispatch

**Jobs**:
1. **snyk-backend**: Scans Maven dependencies
2. **snyk-frontend**: Scans npm dependencies
3. **trivy-fs-scan**: Scans entire codebase
4. **codeql**: Runs GitHub CodeQL analysis for Java and JavaScript
5. **owasp-dependency-check**: Runs OWASP Dependency Check
6. **secret-scan**: Scans for leaked secrets
7. **security-summary**: Generates summary of all scans

**Key Features**:
- Multiple security tools for comprehensive coverage
- SARIF upload to GitHub Security tab
- Configurable severity thresholds
- Security summary in GitHub Actions summary

### 4. e2e-tests.yml - End-to-End Tests

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs**:
1. **e2e-tests**: Runs Selenium tests on Chrome
2. **e2e-tests-firefox**: Runs Selenium tests on Firefox

**Key Features**:
- MySQL service container for database
- Frontend served with `serve` package
- Headless browser execution
- Test report and screenshot uploads on failure
- Proper cleanup of background processes

---

## Setup Instructions

### Step 1: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each required secret from the table above
5. Repeat for all required secrets

### Step 2: Configure SonarQube (Optional)

1. Create a SonarQube account at [SonarCloud](https://sonarcloud.io)
2. Create a new project for EduSubmit
3. Generate an authentication token
4. Add the token as `SONAR_TOKEN` secret
5. Update the SonarQube configuration in `ci.yml`:
   ```yaml
   -Dsonar.projectKey=edusubmit-backend
   -Dsonar.organization=your-organization
   -Dsonar.host.url=https://sonarcloud.io
   ```

### Step 3: Configure Snyk (Optional)

1. Create a Snyk account at [Snyk](https://snyk.io)
2. Connect your GitHub repository to Snyk
3. Generate an authentication token
4. Add the token as `SNYK_TOKEN` secret

### Step 4: Configure Docker Hub

1. Create a Docker Hub account
2. Create an access token (Settings → Security → New Access Token)
3. Add username as `DOCKER_USERNAME` secret
4. Add token as `DOCKER_PASSWORD` secret

### Step 5: Configure Kubernetes (Optional)

1. Get your Kubernetes kubeconfig file
2. Base64 encode it:
   ```bash
   base64 -i ~/.kube/config
   ```
3. Add as `KUBE_CONFIG_STAGING` or `KUBE_CONFIG_PRODUCTION` secret

### Step 6: Configure AWS EC2 (Optional)

1. Create an EC2 instance
2. Generate SSH key pair
3. Base64 encode the private key
4. Add as `EC2_SSH_KEY` secret
5. Add EC2 details as `EC2_HOST` and `EC2_USERNAME` secrets
6. Configure AWS credentials for the EC2 instance

### Step 7: Update Workflow Files (If Needed)

Review and update workflow files to match your specific requirements:
- Update Docker image names in `ci.yml`
- Update Kubernetes namespace names in `deploy.yml`
- Update deployment URLs in `deploy.yml`
- Adjust resource limits and thresholds

### Step 8: Test Workflows

1. Push a small change to `develop` branch
2. Monitor the Actions tab to see workflows running
3. Verify all jobs complete successfully
4. Review test results and security scan reports

---

## Workflow Triggers

### Automatic Triggers

| Workflow | Trigger | Branches |
|----------|---------|----------|
| ci.yml | Push | main, develop |
| ci.yml | Pull Request | main |
| deploy.yml | Push | main (staging only) |
| security-scan.yml | Push | main, develop |
| security-scan.yml | Pull Request | main |
| security-scan.yml | Schedule | Daily at 2 AM UTC |
| e2e-tests.yml | Push | main, develop |
| e2e-tests.yml | Pull Request | main, develop |

### Manual Triggers

All workflows support manual triggering via **workflow_dispatch**:
1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Select branch and any required parameters

---

## Troubleshooting

### Common Issues

#### 1. Docker Login Failed

**Error**: `unauthorized: incorrect username or password`

**Solution**:
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
- Ensure Docker Hub access token has write permissions
- Check if Docker Hub account is active

#### 2. SonarQube Analysis Failed

**Error**: `Unable to execute SonarQube`

**Solution**:
- Verify `SONAR_TOKEN` secret is correct
- Check SonarQube project key and organization
- Ensure SonarQube server is accessible
- Verify network connectivity to SonarCloud

#### 3. Snyk Scan Failed

**Error**: `Snyk authentication failed`

**Solution**:
- Verify `SNYK_TOKEN` secret is correct
- Check if Snyk account is active
- Ensure repository is connected to Snyk

#### 4. Kubernetes Deployment Failed

**Error**: `Unable to connect to the server`

**Solution**:
- Verify `KUBE_CONFIG_STAGING` or `KUBE_CONFIG_PRODUCTION` secret
- Ensure kubeconfig is properly base64 encoded
- Check if Kubernetes cluster is accessible
- Verify kubectl version compatibility

#### 5. AWS EC2 Deployment Failed

**Error**: `SSH connection failed`

**Solution**:
- Verify `EC2_HOST`, `EC2_USERNAME`, and `EC2_SSH_KEY` secrets
- Ensure EC2 instance security group allows SSH
- Check if EC2 instance is running
- Verify SSH key is properly formatted

#### 6. E2E Tests Failed

**Error**: `Frontend not accessible`

**Solution**:
- Check if frontend build completed successfully
- Verify `serve` package is installed
- Check port 3000 is not blocked
- Review test logs for specific errors

#### 7. Maven Build Failed

**Error**: `Could not resolve dependencies`

**Solution**:
- Check Maven dependencies in `pom.xml`
- Verify Maven cache is working
- Check if dependency repositories are accessible
- Review Maven error logs for specific issues

#### 8. NPM Install Failed

**Error**: `npm ERR! code ELIFECYCLE`

**Solution**:
- Check `package.json` for script errors
- Verify Node.js version compatibility
- Clear npm cache: `npm cache clean --force`
- Review npm error logs

### Debugging Tips

1. **Enable Debug Logging**:
   Add `ACTIONS_STEP_DEBUG=true` and `ACTIONS_RUNNER_DEBUG=true` as repository secrets to enable debug logging.

2. **Check Workflow Logs**:
   - Go to Actions tab
   - Click on the failed workflow run
   - Expand failed steps to see detailed logs

3. **Test Locally**:
   - Run tests locally before pushing
   - Test Docker builds locally
   - Validate Kubernetes manifests locally

4. **Use Act for Local Testing**:
   ```bash
   # Install act
   brew install act  # Mac
   # or
   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

   # Run workflow locally
   act -j backend-unit-tests
   ```

---

## Best Practices

### 1. Secret Management
- Never commit secrets to the repository
- Use environment-specific secrets
- Rotate secrets regularly
- Use least privilege principle for access tokens

### 2. Workflow Optimization
- Use caching for Maven and npm dependencies
- Run jobs in parallel when possible
- Use matrix strategy for multiple environments
- Set appropriate timeout values

### 3. Security
- Enable branch protection rules
- Require status checks before merging
- Use Dependabot for dependency updates
- Regularly review security scan results
- Keep action versions updated

### 4. Testing
- Write comprehensive unit tests
- Add integration tests for critical paths
- Run E2E tests before deployment
- Maintain test coverage above 80%

### 5. Deployment
- Use blue-green deployment strategy
- Implement rollback procedures
- Monitor deployment health
- Use feature flags for gradual rollouts

### 6. Monitoring
- Set up alerts for failed workflows
- Monitor build times
- Track deployment frequency
- Review security scan results regularly

### 7. Documentation
- Keep workflow files well-commented
- Document secret requirements
- Maintain runbooks for common issues
- Update documentation with changes

---

## Quick Reference

### Workflow Status Check

```bash
# List recent workflow runs
gh run list

# View specific run details
gh run view <run-id>

# Re-run failed workflow
gh run rerun <run-id>
```

### Secret Management

```bash
# List repository secrets (requires gh CLI)
gh secret list

# Set a secret
gh secret set SECRET_NAME

# Delete a secret
gh secret delete SECRET_NAME
```

### Local Testing

```bash
# Run Maven tests locally
cd backend
mvn clean test

# Run npm tests locally
cd frontend
npm test

# Build Docker images locally
docker build -t edusubmit-backend:latest ./backend
docker build -t edusubmit-frontend:latest ./frontend

# Validate Kubernetes manifests
kubectl apply --dry-run=client -f k8s/staging/deployments.yaml
```

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review workflow logs for detailed error messages
3. Consult official documentation:
   - GitHub Actions: https://docs.github.com/en/actions
   - Docker: https://docs.docker.com/
   - Kubernetes: https://kubernetes.io/docs/
   - SonarQube: https://docs.sonarqube.org/
   - Snyk: https://support.snyk.io/
