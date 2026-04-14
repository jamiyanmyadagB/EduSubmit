# GitHub Secrets Configuration Guide

This document provides step-by-step instructions for setting up all required GitHub secrets for the EduSubmit CI/CD pipeline.

## Required Secrets

### 1. Docker Hub Credentials

```bash
# Get Docker Hub credentials
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-access-token  # Use access token, not password
```

**Setup Steps:**
1. Go to [Docker Hub](https://hub.docker.com/)
2. Create an access token: Account Settings → Security → New Access Token
3. Add to GitHub repository secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token

### 2. SonarQube/SonarCloud Token

```bash
# Get SonarCloud token (recommended)
# Or set up self-hosted SonarQube
SONAR_TOKEN=your-sonar-token
```

**Setup Steps (SonarCloud):**
1. Go to [SonarCloud](https://sonarcloud.io/)
2. Create organization and project
3. Generate token: My Account → Security → Generate Token
4. Add `SONAR_TOKEN` to GitHub secrets

**Setup Steps (Self-hosted SonarQube):**
1. Deploy SonarQube server
2. Create project and generate token
3. Add `SONAR_TOKEN` and `SONAR_HOST_URL` to GitHub secrets

### 3. Snyk Security Token

```bash
# Get Snyk token
SNYK_TOKEN=your-snyk-token
```

**Setup Steps:**
1. Go to [Snyk](https://snyk.io/)
2. Create account
3. Generate token: Account Settings → General → API Token
4. Add `SNYK_TOKEN` to GitHub secrets

### 4. Staging Environment Credentials

```bash
# Staging server SSH credentials
STAGING_HOST=staging.example.com
STAGING_USER=deploy-user
STAGING_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
your-private-key-content
-----END OPENSSH PRIVATE KEY-----

# Staging environment variables
MYSQL_ROOT_PASSWORD=staging_db_password
MYSQL_PASSWORD=staging_user_password
JWT_SECRET=staging_jwt_secret_key_here
EMAIL_USERNAME=staging@email.com
EMAIL_PASSWORD=staging_email_password
GRAFANA_PASSWORD=staging_grafana_admin
```

**Setup Steps:**
1. Generate SSH key pair: `ssh-keygen -t ed25519 -C "github-actions"`
2. Add public key to staging server's `~/.ssh/authorized_keys`
3. Add private key to GitHub secrets as `STAGING_KEY`
4. Add other environment variables as needed

### 5. Production Environment Credentials

```bash
# Production server SSH credentials
PRODUCTION_HOST=production.example.com
PRODUCTION_USER=deploy-user
PRODUCTION_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
your-production-private-key-content
-----END OPENSSH PRIVATE KEY-----

# Production environment variables
PROD_MYSQL_ROOT_PASSWORD=production_db_password
PROD_MYSQL_PASSWORD=production_user_password
PROD_JWT_SECRET=production_jwt_secret_key_here
PROD_EMAIL_USERNAME=production@email.com
PROD_EMAIL_PASSWORD=production_email_password
```

### 6. ArgoCD Configuration

```bash
# ArgoCD server details
ARGOCD_SERVER=argocd.example.com
ARGOCD_USERNAME=admin
ARGOCD_PASSWORD=argocd-password

# GitOps repository
ARGOCD_CONFIG_REPO=https://github.com/your-org/edusubmit-k8s-manifests.git
```

**Setup Steps:**
1. Install ArgoCD in Kubernetes cluster
2. Create GitOps repository for Kubernetes manifests
3. Add ArgoCD credentials to GitHub secrets

### 7. Notification Configuration

```bash
# Slack webhook for notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email notifications (optional)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=notifications@example.com
EMAIL_PASSWORD=email_app_password
```

## GitHub Secrets Setup Steps

### Method 1: Using GitHub UI

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret from the list above

### Method 2: Using GitHub CLI

```bash
# Install GitHub CLI first
# Then set secrets using gh command

gh secret set DOCKER_USERNAME --body "your-dockerhub-username"
gh secret set DOCKER_PASSWORD --body "your-dockerhub-access-token"
gh secret set SONAR_TOKEN --body "your-sonar-token"
gh secret set SNYK_TOKEN --body "your-snyk-token"
gh secret set STAGING_HOST --body "staging.example.com"
gh secret set STAGING_USER --body "deploy-user"
gh secret set STAGING_KEY --body "$(cat ~/.ssh/staging_key)"
```

## Environment-Specific Secrets

### Staging Environment
- Database credentials
- JWT secrets
- Email configuration
- Monitoring passwords

### Production Environment
- Stronger passwords
- Different JWT secrets
- Production email accounts
- Enhanced monitoring

## Security Best Practices

1. **Use Access Tokens**: Always use access tokens instead of passwords
2. **Rotate Regularly**: Update secrets every 90 days
3. **Least Privilege**: Grant minimum necessary permissions
4. **Audit Access**: Monitor who has access to secrets
5. **Encrypt Keys**: Use SSH keys for server access

## Testing Secrets Configuration

After setting up secrets, test the configuration:

```bash
# Test Docker Hub access
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Test SonarQube connection
curl -u $SONAR_TOKEN: https://sonarcloud.io/api/me

# Test Snyk connection
snyk auth $SNYK_TOKEN

# Test SSH access
ssh -i staging_key $STAGING_USER@$STAGING_HOST
```

## Troubleshooting

### Common Issues

1. **Invalid Credentials**: Double-check token/username combinations
2. **Permission Issues**: Ensure tokens have necessary permissions
3. **SSH Key Format**: Use proper OpenSSH private key format
4. **Network Access**: Verify GitHub Actions can reach external services

### Debug Commands

```bash
# Test Docker Hub authentication
echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin

# Test SonarQube API
curl -X POST -u $SONAR_TOKEN: https://sonarcloud.io/api/projects/search

# Test Snyk authentication
snyk auth $SNYK_TOKEN && snyk test --dry-run
```

## Maintenance

### Regular Tasks

1. **Monthly**: Review and rotate sensitive secrets
2. **Quarterly**: Audit access permissions
3. **Annually**: Update SSH keys and tokens

### Emergency Procedures

1. **Compromised Secrets**: Immediately rotate all affected secrets
2. **Service Outages**: Update service-specific credentials
3. **Team Changes**: Remove access for departed team members

---

**Important**: Never commit secrets to your repository. Always use GitHub's encrypted secrets feature for sensitive information.
