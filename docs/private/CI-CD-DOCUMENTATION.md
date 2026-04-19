# EduSubmit CI/CD Pipeline Documentation

## Overview

This document provides comprehensive documentation for the EduSubmit CI/CD pipeline, including setup instructions, configuration details, and operational procedures.

## Table of Contents

1. [Pipeline Architecture](#pipeline-architecture)
2. [Prerequisites](#prerequisites)
3. [GitHub Actions Configuration](#github-actions-configuration)
4. [Docker Configuration](#docker-configuration)
5. [Security Integration](#security-integration)
6. [Deployment Procedures](#deployment-procedures)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance and Updates](#maintenance-and-updates)

## Pipeline Architecture

### CI/CD Flow

```
Git Push/Pull Request → GitHub Actions Pipeline
    ├── Build & Test
    ├── Code Quality (SonarQube)
    ├── Security Scanning (Snyk, OWASP)
    ├── Docker Build & Push to Docker Hub
    ├── Deploy to Staging
    ├── Smoke Tests
    ├── Deploy to Production (main branch only)
    └── GitOps Sync (ArgoCD)
```

### Environment Architecture

- **Development**: Local development with Docker Compose
- **Staging**: Kubernetes cluster with full monitoring
- **Production**: Production-grade Kubernetes deployment

## Prerequisites

### Required Tools and Services

1. **Development Environment**
   - Docker Desktop
   - Git
   - Node.js 18+
   - Java 17
   - Maven 3.9+

2. **CI/CD Services**
   - GitHub repository with Actions enabled
   - Docker Hub account
   - SonarQube server (SonarCloud recommended)
   - Snyk account
   - Kubernetes cluster (for staging/production)
   - ArgoCD installed in cluster

3. **Required GitHub Secrets**
   ```yaml
   DOCKER_USERNAME: your-dockerhub-username
   DOCKER_PASSWORD: your-dockerhub-password
   SONAR_TOKEN: your-sonar-token
   SNYK_TOKEN: your-snyk-token
   STAGING_HOST: staging-server-host
   STAGING_USER: staging-server-user
   STAGING_KEY: staging-ssh-key
   PRODUCTION_HOST: production-server-host
   PRODUCTION_USER: production-server-user
   PRODUCTION_KEY: production-ssh-key
   ARGOCD_CONFIG_REPO: argocd-config-repo-url
   ARGOCD_SERVER: argocd-server-url
   ARGOCD_USERNAME: argocd-username
   ARGOCD_PASSWORD: argocd-password
   SLACK_WEBHOOK: slack-webhook-url
   ```

## GitHub Actions Configuration

### Pipeline Stages

#### 1. Build and Test Stage
- Compiles Java application using Maven
- Runs unit tests with JUnit
- Generates JaCoCo coverage reports
- Uploads test artifacts

#### 2. Code Quality Stage
- Runs SonarQube analysis
- Enforces quality gates
- Fails pipeline if quality standards not met

#### 3. Security Scanning Stage
- Snyk dependency scanning
- OWASP dependency check
- Container vulnerability scanning

#### 4. Docker Build and Push Stage
- Multi-platform Docker build (AMD64, ARM64)
- Secure authentication with Docker Hub
- Image verification and SBOM generation

#### 5. Deployment Stages
- Staging deployment (develop branch)
- Production deployment (main branch)
- Post-deployment smoke tests

### Pipeline Triggers

- **Push to main/develop branches**: Full pipeline execution
- **Pull requests**: Build, test, quality, and security checks only
- **Manual triggers**: Available for specific deployments

## Docker Configuration

### Multi-Stage Dockerfile

The Dockerfile uses a multi-stage build approach:

1. **Builder Stage**: Maven build with dependency caching
2. **Runtime Stage**: Minimal JRE image with security hardening

### Key Features

- Non-root user execution
- Health checks for all services
- Environment-based service selection
- Optimized layer caching
- Security labels and metadata

### Docker Hub Integration

```bash
# Build and push manually
docker build -t edusubmit/backend:latest ./edusubmit-backend
docker push edusubmit/backend:latest

# Verify image
docker pull edusubmit/backend:latest
docker run --rm edusubmit/backend:latest java -version
```

## Security Integration

### SonarQube Configuration

```xml
<!-- pom.xml configuration -->
<plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
    <version>3.9.1.2184</version>
</plugin>
```

### Quality Gate Rules

- Coverage: > 80%
- Duplicated Lines: < 3%
- Maintainability Rating: A
- Reliability Rating: A
- Security Rating: A

### Snyk Integration

```bash
# Local Snyk scan
snyk test --all-projects --severity-threshold=high

# Container scan
snyk container test edusubmit/backend:latest --severity-threshold=high
```

## Deployment Procedures

### Staging Deployment

#### Using Docker Compose

```bash
# Set environment variables
export DOCKER_REGISTRY=docker.io
export IMAGE_TAG=latest
export MYSQL_ROOT_PASSWORD=your_password

# Deploy
docker-compose -f edusubmit-backend/docker-compose.staging.yml up -d

# Check status
docker-compose -f edusubmit-backend/docker-compose.staging.yml ps

# Run smoke tests
./scripts/smoke-tests.sh
```

#### Using Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/staging/

# Check deployment
kubectl get pods -n edusubmit-staging
kubectl get services -n edusubmit-staging

# Check logs
kubectl logs -f deployment/api-gateway -n edusubmit-staging
```

### Production Deployment

Production deployments are automated through the GitHub Actions pipeline when pushing to the main branch.

#### Manual Production Deployment

```bash
# Using deployment script
./scripts/deploy-staging.sh --environment production --tag v1.0.0

# Using kubectl
kubectl set image deployment/api-gateway api-gateway=edusubmit/backend:v1.0.0 -n edusubmit-production
kubectl rollout status deployment/api-gateway -n edusubmit-production
```

## Monitoring and Observability

### Prometheus Configuration

- **Metrics Collection**: Spring Boot Actuator endpoints
- **Scrape Interval**: 15 seconds
- **Retention**: 200 hours
- **Alerting**: Configured through AlertManager

### Grafana Dashboards

- **Application Metrics**: Response time, throughput, error rates
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: User registrations, assignment submissions

### Health Checks

All services expose health endpoints:

```bash
# Application health
curl http://localhost:8080/actuator/health

# Readiness probe
curl http://localhost:8080/actuator/health/readiness

# Liveness probe
curl http://localhost:8080/actuator/health/liveness
```

## Troubleshooting

### Common Issues

#### 1. Docker Build Failures

```bash
# Check build logs
docker build --progress=plain -t edusubmit/backend:latest ./edusubmit-backend

# Common solutions:
# - Check Maven dependencies in pom.xml
# - Verify Java version compatibility
# - Check Dockerfile syntax
```

#### 2. Pipeline Failures

```bash
# Check GitHub Actions logs
# Navigate to: Repository > Actions > Workflow Run

# Common solutions:
# - Verify GitHub secrets are correctly configured
# - Check service connectivity (SonarQube, Snyk, Docker Hub)
# - Validate YAML syntax in workflow files
```

#### 3. Deployment Issues

```bash
# Check pod status
kubectl get pods -n edusubmit-staging
kubectl describe pod <pod-name> -n edusubmit-staging

# Check service connectivity
kubectl get services -n edusubmit-staging
kubectl port-forward service/api-gateway 8080:8080 -n edusubmit-staging

# Check logs
kubectl logs -f deployment/api-gateway -n edusubmit-staging
```

### Debug Commands

```bash
# Database connectivity
kubectl exec -it deployment/mysql -n edusubmit-staging -- mysql -u root -p

# Redis connectivity
kubectl exec -it deployment/redis -n edusubmit-staging -- redis-cli ping

# Application debugging
kubectl exec -it deployment/api-gateway -n edusubmit-staging -- curl localhost:8080/actuator/health
```

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Weekly**
   - Review pipeline performance metrics
   - Update dependency versions
   - Check security scan results

2. **Monthly**
   - Update base Docker images
   - Review and update quality gates
   - Backup configurations and secrets

3. **Quarterly**
   - Major dependency updates
   - Pipeline optimization review
   - Security audit

### Update Procedures

#### Application Updates

1. Update version in `pom.xml`
2. Update Docker image tags in manifests
3. Run full pipeline on develop branch
4. Merge to main for production deployment

#### Infrastructure Updates

1. Update Kubernetes manifests in `k8s/` directory
2. Update ArgoCD configuration
3. Test in staging environment
4. Apply to production

#### Security Updates

1. Monitor vulnerability reports from Snyk
2. Update dependencies as needed
3. Re-run security scans
4. Deploy updates through pipeline

## Best Practices

### Security

1. **Secrets Management**
   - Use GitHub repository secrets
   - Rotate credentials regularly
   - Never commit secrets to repository

2. **Container Security**
   - Use non-root users
   - Minimal base images
   - Regular vulnerability scanning

3. **Network Security**
   - Use HTTPS everywhere
   - Implement rate limiting
   - Network segmentation in Kubernetes

### Performance

1. **Build Optimization**
   - Leverage Docker layer caching
   - Parallel builds where possible
   - Optimize Maven dependencies

2. **Deployment Optimization**
   - Use rolling updates
   - Implement proper health checks
   - Configure resource limits

### Reliability

1. **Error Handling**
   - Implement retry logic
   - Proper error notifications
   - Automated rollback on failure

2. **Monitoring**
   - Comprehensive logging
   - Real-time alerts
   - Performance metrics

## Support and Contact

For issues related to the CI/CD pipeline:

1. **Documentation**: Check this document first
2. **Logs**: Review GitHub Actions and application logs
3. **Team**: Contact the DevOps team for complex issues
4. **Emergency**: Use rollback procedures for critical failures

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: EduSubmit DevOps Team
