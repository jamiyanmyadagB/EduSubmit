## 1. Docker Hub
- [ ] Create account at https://hub.docker.com
- [ ] Create repository named: edusubmit/backend
- [ ] Generate Access Token: Account Settings → Security → New Access Token
- [ ] Save token safely (shown only once)
- [ ] Add to GitHub Secrets:
      DOCKER_USERNAME = your dockerhub username
      DOCKER_PASSWORD = your dockerhub access token (NOT your password)
- [ ] Test locally:
      docker login -u YOUR_USERNAME
      docker build -t YOUR_USERNAME/edusubmit-backend:test ./edusubmit-backend
      docker push YOUR_USERNAME/edusubmit-backend:test

## 2. SonarCloud (Code Quality)
- [ ] Create account at https://sonarcloud.io (free for public repos)
- [ ] Create new organization (use your GitHub username)
- [ ] Create new project → choose EduSubmit repo
- [ ] Go to: My Account → Security → Generate Token
- [ ] Add to GitHub Secrets:
      SONAR_TOKEN = your sonarcloud token
- [ ] Update in .github/workflows/ci-cd-pipeline.yml:
      -Dsonar.organization=YOUR_GITHUB_USERNAME
      -Dsonar.projectKey=edusubmit-backend

## 3. Snyk (Security Scanning)
- [ ] Create account at https://snyk.io (free tier available)
- [ ] Go to: Account Settings → General → Auth Token
- [ ] Copy your API token
- [ ] Add to GitHub Secrets:
      SNYK_TOKEN = your snyk token

## 4. GitHub Actions Secrets (Full List)
Go to: GitHub Repo → Settings → Secrets and variables → Actions
→ New repository secret

| Secret Name         | Value                         | Where to get            |
|---------------------|-------------------------------|-------------------------|
| DOCKER_USERNAME     | your dockerhub username       | hub.docker.com          |
| DOCKER_PASSWORD     | dockerhub access token        | hub.docker.com settings |
| SONAR_TOKEN         | sonarcloud token              | sonarcloud.io           |
| SNYK_TOKEN          | snyk api token                | snyk.io settings        |
| JWT_SECRET          | 64 char random string         | generate below          |
| MYSQL_ROOT_PASSWORD | strong password               | you choose              |
| MYSQL_PASSWORD      | strong password               | you choose              |
| MYSQL_USER          | edusubmit_user                | you choose              |
| GRAFANA_PASSWORD    | strong password               | you choose              |
| SLACK_WEBHOOK       | slack webhook url (optional)  | api.slack.com           |
| AWS_ACCESS_KEY_ID   | aws access key                | aws iam console         |
| AWS_SECRET_ACCESS_KEY | aws secret key              | aws iam console         |

Generate JWT_SECRET:
  openssl rand -hex 64

## 5. Jenkins Setup
- [ ] Run Jenkins with Docker:
      docker run -d -p 8085:8080 -p 50000:50000 \
        -v jenkins_home:/var/jenkins_home \
        --name jenkins jenkins/jenkins:lts
- [ ] Open http://localhost:8085
- [ ] Install plugins: Docker Pipeline, SonarQube Scanner,
      Snyk Security, Email Extension
- [ ] Add credentials (Manage Jenkins → Credentials):
      ID: docker-hub-credentials  → Username + Password
      ID: sonar-token             → Secret Text
      ID: snyk-token              → Secret Text
      ID: jwt-secret              → Secret Text
- [ ] Configure SonarQube:
      Manage Jenkins → System → SonarQube servers
      Name: SonarCloud
      URL: https://sonarcloud.io
- [ ] Create Pipeline job pointing to Jenkinsfile

## 6. AWS Credentials
- [ ] Create IAM user with permissions:
      AmazonEKSClusterPolicy, AmazonEC2FullAccess,
      IAMFullAccess, AmazonVPCFullAccess
- [ ] Generate Access Key + Secret Key
- [ ] Configure locally:
      aws configure
- [ ] Add to GitHub Secrets:
      AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- [ ] Test: aws sts get-caller-identity

## 7. Kubernetes Secrets
- [ ] Never commit real secrets.yaml to git
- [ ] Generate base64 values:
      echo -n 'your_password' | base64
- [ ] Apply manually:
      kubectl apply -f k8s/staging/secrets.yaml
- [ ] Confirm gitignore blocks it:
      git check-ignore -v k8s/staging/secrets.yaml

## 8. Verify Pipeline End to End
- [ ] Push to develop → staging pipeline triggers
- [ ] Check GitHub Actions tab for green checkmarks
- [ ] Check Docker Hub for new image
- [ ] Check SonarCloud for quality gate
- [ ] Check Snyk for security scan result
- [ ] Push to main → production pipeline triggers
---
