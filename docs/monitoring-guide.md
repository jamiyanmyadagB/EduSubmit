# EduSubmit Monitoring Guide

Complete guide for setting up, accessing, and using the monitoring system for EduSubmit.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Local Development Setup](#local-development-setup)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Accessing Monitoring Services](#accessing-monitoring-services)
6. [Grafana Dashboards](#grafana-dashboards)
7. [Prometheus Metrics](#prometheus-metrics)
8. [Alerting](#alerting)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

EduSubmit uses a comprehensive monitoring stack based on:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Exporters**: MySQL, Redis, Node exporters for infrastructure metrics
- **Spring Boot Actuator**: Application metrics from backend

### Key Features
- Real-time application performance monitoring
- Infrastructure health tracking (CPU, memory, disk, network)
- Database performance metrics
- Cache performance monitoring
- Custom alerting rules
- Pre-configured dashboards for quick insights

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     EduSubmit Monitoring Stack              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Backend    │──────│  Prometheus  │                    │
│  │  (Actuator)  │      │   (9090)     │                    │
│  └──────────────┘      └──────┬───────┘                    │
│                                │                             │
│  ┌──────────────┐      ┌──────▼───────┐                    │
│  │   MySQL      │──────│    Grafana   │                    │
│  │  (Exporter)  │      │   (3001)     │                    │
│  └──────────────┘      └──────────────┘                    │
│                                │                             │
│  ┌──────────────┐      ┌──────┬───────┐                    │
│  │    Redis     │──────│      │       │                    │
│  │  (Exporter)  │      │  Dashboards │                    │
│  └──────────────┘      └──────────────┘                    │
│                                │                             │
│  ┌──────────────┐      ┌──────┴───────┐                    │
│  │   Node       │──────│   Alerts     │                    │
│  │  (Exporter)  │      │              │                    │
│  └──────────────┘      └──────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Local Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Docker Desktop running (Windows/Mac) or Docker daemon running (Linux)

### Starting Monitoring Services

#### Option 1: Using docker-compose.yml (Production-like)
```bash
# Start all services including monitoring
docker-compose up -d

# Check monitoring services status
docker-compose ps prometheus grafana mysql-exporter redis-exporter node-exporter

# View logs
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

#### Option 2: Using docker-compose.dev.yml (Development)
```bash
# Start development environment with monitoring
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Monitoring Configuration
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
GRAFANA_ALLOW_SIGN_UP=false

# Database Configuration (for MySQL Exporter)
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=edusubmit_user
MYSQL_PASSWORD=edusubmit_password
MYSQL_DATABASE=edusubmit

# Redis Configuration (for Redis Exporter)
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (Minikube, Kind, or cloud provider)
- kubectl configured to access cluster
- Namespace created: `edusubmit-production` or `edusubmit-staging`

### Deploying Monitoring Stack

#### Production Environment
```bash
# Create namespace
kubectl create namespace edusubmit-production

# Apply monitoring manifests
kubectl apply -f k8s/production/monitoring.yaml

# Apply ConfigMaps (create these from monitoring configs)
kubectl create configmap prometheus-config \
  --from-file=monitoring/prometheus/prometheus.yml \
  --namespace=edusubmit-production

kubectl create configmap grafana-provisioning \
  --from-file=monitoring/grafana/provisioning/ \
  --namespace=edusubmit-production

kubectl create configmap grafana-dashboards \
  --from-file=monitoring/grafana/dashboards/ \
  --namespace=edusubmit-production

# Create secrets
kubectl create secret generic edusubmit-secrets \
  --from-literal=grafana-admin-user=admin \
  --from-literal=grafana-admin-password=admin \
  --from-literal=mysql-exporter-dsn="edusubmit_user:edusubmit_password@(mysql-service:3306)/" \
  --namespace=edusubmit-production

# Verify deployment
kubectl get pods -n edusubmit-production
kubectl get services -n edusubmit-production
```

#### Staging Environment
```bash
# Create namespace
kubectl create namespace edusubmit-staging

# Apply monitoring manifests
kubectl apply -f k8s/staging/monitoring.yaml

# Apply ConfigMaps
kubectl create configmap prometheus-config \
  --from-file=monitoring/prometheus/prometheus.yml \
  --namespace=edusubmit-staging

kubectl create configmap grafana-provisioning \
  --from-file=monitoring/grafana/provisioning/ \
  --namespace=edusubmit-staging

kubectl create configmap grafana-dashboards \
  --from-file=monitoring/grafana/dashboards/ \
  --namespace=edusubmit-staging

# Create secrets
kubectl create secret generic edusubmit-secrets \
  --from-literal=grafana-admin-user=admin \
  --from-literal=grafana-admin-password=admin \
  --from-literal=mysql-exporter-dsn="edusubmit_user:edusubmit_password@(mysql-service:3306)/" \
  --namespace=edusubmit-staging

# Verify deployment
kubectl get pods -n edusubmit-staging
kubectl get services -n edusubmit-staging
```

### Accessing Services in Kubernetes

#### Port Forwarding
```bash
# Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n edusubmit-production

# Grafana
kubectl port-forward svc/grafana-service 3001:3000 -n edusubmit-production
```

#### Ingress (Recommended for Production)
Create an Ingress resource to expose services via domain names.

---

## Accessing Monitoring Services

### Default Ports and URLs

| Service | Local Port | Kubernetes Port | URL |
|---------|------------|-----------------|-----|
| Prometheus | 9090 | 9090 | http://localhost:9090 |
| Grafana | 3001 | 3000 | http://localhost:3001 |
| MySQL Exporter | 9104 | 9104 | http://localhost:9104/metrics |
| Redis Exporter | 9121 | 9121 | http://localhost:9121/metrics |
| Node Exporter | 9100 | 9100 | http://localhost:9100/metrics |

### Prometheus Access

#### Web Interface
1. Open browser: `http://localhost:9090`
2. Navigate to:
   - **Status → Targets**: Check if all targets are up
   - **Graph**: Query and visualize metrics
   - **Alerts**: View active alerts

#### Common Queries
```promql
# Backend service status
up{job="edusubmit-backend"}

# HTTP request rate
rate(http_server_requests_seconds_count{job="edusubmit-backend"}[5m])

# Response time (95th percentile)
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{job="edusubmit-backend"}[5m]))

# JVM memory usage
jvm_memory_used_bytes{job="edusubmit-backend", area="heap"} / 1024 / 1024

# CPU usage
rate(process_cpu_seconds_total{job="edusubmit-backend"}[5m]) * 100

# MySQL status
mysql_up

# Redis memory usage
redis_memory_used_bytes / 1024 / 1024

# Node CPU usage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Grafana Access

#### Login
1. Open browser: `http://localhost:3001`
2. Default credentials:
   - Username: `admin`
   - Password: `admin` (change this in production!)

#### First-Time Setup
1. Change default password
2. Add Prometheus datasource (auto-configured via provisioning)
3. Import dashboards (auto-loaded from provisioning)

---

## Grafana Dashboards

### Available Dashboards

#### 1. EduSubmit Application Dashboard
**Purpose**: Monitor backend application performance

**Panels**:
- Service Status (UP/DOWN)
- JVM Memory Used
- CPU Usage
- Database Connections
- HTTP Request Rate
- Response Time (95th/50th percentile)
- JVM Memory Usage (Heap)
- Garbage Collection
- Thread Count
- HTTP Error Rate

**Key Metrics to Watch**:
- Service Status should always be UP
- CPU Usage should be < 80%
- Memory usage should be < 80% of max
- Response time 95th percentile should be < 1s
- Error rate should be < 1%

#### 2. EduSubmit Infrastructure Dashboard
**Purpose**: Monitor infrastructure health

**Panels**:
- MySQL Status
- Redis Status
- Node Exporter Status
- Prometheus Status
- CPU Usage
- Memory Usage
- Disk Usage
- Network I/O
- MySQL Connections
- Redis Memory Usage

**Key Metrics to Watch**:
- All services should be UP
- Disk usage should be < 80%
- Memory usage should be < 80%
- Network I/O should be stable

#### 3. EduSubmit Business Analytics Dashboard
**Purpose**: Monitor business metrics (requires custom metrics)

**Panels**:
- Active Users
- User Registration Rate
- Pending Assignments
- Assignment Submissions
- Average Grading Time
- Active Courses
- API Response Time
- Error Rate
- Cache Hit Rate
- Database Performance
- Total Enrollments
- Plagiarism Check Time

**Note**: This dashboard uses custom business metrics that need to be implemented in the application.

### Creating Custom Dashboards

1. Go to Grafana → Dashboards → New → Import
2. Paste dashboard JSON or enter dashboard ID
3. Select Prometheus datasource
4. Click Import

---

## Prometheus Metrics

### Spring Boot Actuator Metrics

The backend exposes metrics via Spring Boot Actuator at `/actuator/prometheus`.

#### JVM Metrics
- `jvm_memory_used_bytes`: Memory usage
- `jvm_memory_max_bytes`: Maximum memory
- `jvm_threads_live_threads`: Live thread count
- `jvm_gc_pause_seconds_count`: GC count
- `jvm_gc_pause_seconds_sum`: GC time

#### HTTP Metrics
- `http_server_requests_seconds_count`: Request count
- `http_server_requests_seconds_sum`: Request duration
- `http_server_requests_seconds_bucket`: Request duration histogram

#### Database Metrics
- `hikaricp_connections_active`: Active DB connections
- `hikaricp_connections_idle`: Idle DB connections
- `hikaricp_connections_max`: Max DB connections

### Infrastructure Metrics

#### MySQL Exporter
- `mysql_up`: MySQL status
- `mysql_global_status_queries`: Query rate
- `mysql_global_status_slow_queries`: Slow query count
- `mysql_global_status_threads_connected`: Connection count

#### Redis Exporter
- `redis_up`: Redis status
- `redis_memory_used_bytes`: Memory usage
- `redis_memory_max_bytes`: Max memory
- `redis_connected_clients`: Connected clients

#### Node Exporter
- `node_cpu_seconds_total`: CPU time
- `node_memory_MemAvailable_bytes`: Available memory
- `node_memory_MemTotal_bytes`: Total memory
- `node_filesystem_avail_bytes`: Available disk space
- `node_filesystem_size_bytes`: Total disk space
- `node_network_receive_bytes_total`: Network RX
- `node_network_transmit_bytes_total`: Network TX

---

## Alerting

### Configured Alerts

Alert rules are defined in `monitoring/prometheus/alert_rules.yml`.

#### Critical Alerts
- **ServiceDown**: Service has been down for > 1 minute
- **DatabaseConnectionPoolExhaustion**: DB pool > 90% full
- **MySQLDown**: MySQL has been down for > 1 minute
- **RedisDown**: Redis has been down for > 1 minute
- **DiskSpaceLow**: Disk space < 10%

#### Warning Alerts
- **HighErrorRate**: Error rate > 0.1 errors/sec
- **HighResponseTime**: 95th percentile response time > 1s
- **HighMemoryUsage**: Memory usage > 512MB
- **HighCPUUsage**: CPU usage > 80%
- **MySQLSlowQueries**: Slow query rate > 0.1/sec
- **RedisMemoryHigh**: Redis memory > 90%
- **PodRestartHigh**: Pod restarting frequently
- **CertificateExpiringSoon**: Certificate expires in 7 days

### Viewing Alerts

#### Prometheus UI
1. Go to `http://localhost:9090/alerts`
2. View active, pending, and inactive alerts
3. Click on alert for details

#### Grafana Alerting
1. Go to Grafana → Alerting
2. Configure notification channels (email, Slack, PagerDuty)
3. Set up alert rules based on Prometheus queries

---

## Troubleshooting

### Common Issues

#### 1. Prometheus Not Scraping Metrics

**Symptoms**: Targets show as DOWN in Prometheus UI

**Solutions**:
```bash
# Check if backend is exposing metrics
curl http://localhost:8080/actuator/prometheus

# Check Prometheus configuration
docker-compose logs prometheus

# Verify network connectivity
docker-compose exec prometheus ping backend

# Check if Spring Boot Actuator is enabled
# Verify application.yml has:
# management:
#   endpoints:
#     web:
#       exposure:
#         include: prometheus,health,info
```

#### 2. Grafana Cannot Connect to Prometheus

**Symptoms**: Grafana shows "Datasource not found" or "Connection refused"

**Solutions**:
```bash
# Check Grafana datasource configuration
# File: monitoring/grafana/provisioning/datasources/prometheus.yml
# Ensure URL is: http://prometheus:9090

# Restart Grafana
docker-compose restart grafana

# Check Grafana logs
docker-compose logs grafana

# Verify Prometheus is accessible from Grafana container
docker-compose exec grafana ping prometheus
```

#### 3. MySQL Exporter Not Working

**Symptoms**: MySQL exporter shows as DOWN

**Solutions**:
```bash
# Check MySQL exporter logs
docker-compose logs mysql-exporter

# Verify MySQL connection string
# Ensure DATA_SOURCE_NAME format: user:password@(host:port)/

# Test MySQL connection
docker-compose exec mysql-exporter mysql -h mysql -u edusubmit_user -p

# Check if MySQL is running
docker-compose ps mysql
```

#### 4. Redis Exporter Not Working

**Symptoms**: Redis exporter shows as DOWN

**Solutions**:
```bash
# Check Redis exporter logs
docker-compose logs redis-exporter

# Verify Redis address
# Ensure REDIS_ADDR: redis:6379

# Test Redis connection
docker-compose exec redis redis-cli ping

# Check if Redis is running
docker-compose ps redis
```

#### 5. Node Exporter Not Working

**Symptoms**: Node exporter shows as DOWN

**Solutions**:
```bash
# Check Node exporter logs
docker-compose logs node-exporter

# Verify host paths are mounted correctly
docker-compose exec node-exporter ls -la /host/proc

# Check if metrics are exposed
curl http://localhost:9100/metrics
```

#### 6. Dashboards Not Loading

**Symptoms**: Grafana dashboards show "No data" or "Panel not found"

**Solutions**:
```bash
# Check if dashboards are mounted
docker-compose exec grafana ls -la /var/lib/grafana/dashboards

# Restart Grafana to reload dashboards
docker-compose restart grafana

# Check dashboard provisioning logs
docker-compose logs grafana

# Verify Prometheus has data
# Go to Prometheus UI and run: up
```

### Debugging Commands

```bash
# Check all monitoring services
docker-compose ps prometheus grafana mysql-exporter redis-exporter node-exporter

# View logs for all monitoring services
docker-compose logs prometheus grafana mysql-exporter redis-exporter node-exporter

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check Prometheus configuration
curl http://localhost:9090/api/v1/status/config

# Check Grafana health
curl http://localhost:3001/api/health

# Test backend metrics endpoint
curl http://localhost:8080/actuator/prometheus

# Test MySQL exporter
curl http://localhost:9104/metrics

# Test Redis exporter
curl http://localhost:9121/metrics

# Test Node exporter
curl http://localhost:9100/metrics
```

---

## Best Practices

### 1. Resource Limits
Set appropriate resource limits for monitoring services:

```yaml
# Production
prometheus:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

grafana:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "250m"
```

### 2. Data Retention
Configure Prometheus data retention based on needs:

```yaml
# In prometheus.yml or command args
--storage.tsdb.retention.time=30d  # Keep 30 days of data
--storage.tsdb.retention.size=10GB  # Keep max 10GB
```

### 3. Alerting
- Set up notification channels (email, Slack, PagerDuty)
- Configure alert routing based on severity
- Test alerts regularly
- Document alert runbooks

### 4. Security
- Change default Grafana password
- Use HTTPS in production
- Restrict access via firewall/ingress
- Use secrets for sensitive data
- Enable authentication for Prometheus (optional)

### 5. High Availability
For production:
- Deploy Prometheus with Thanos or Cortex for long-term storage
- Use multiple Prometheus replicas
- Configure Grafana with persistent storage
- Set up backup for Grafana dashboards

### 6. Performance
- Adjust scrape intervals based on needs
- Use recording rules for expensive queries
- Optimize dashboard queries
- Use alertmanager for alert deduplication

---

## Quick Reference

### Start Monitoring (Local)
```bash
docker-compose up -d prometheus grafana mysql-exporter redis-exporter node-exporter
```

### Access Services
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Check Status
```bash
docker-compose ps
curl http://localhost:9090/api/v1/targets
```

### View Logs
```bash
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

### Stop Monitoring
```bash
docker-compose stop prometheus grafana mysql-exporter redis-exporter node-exporter
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/production/monitoring.yaml
kubectl port-forward svc/prometheus-service 9090:9090 -n edusubmit-production
kubectl port-forward svc/grafana-service 3001:3000 -n edusubmit-production
```

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Verify configuration files
4. Check Prometheus targets status
5. Consult official documentation:
   - Prometheus: https://prometheus.io/docs/
   - Grafana: https://grafana.com/docs/
   - Spring Boot Actuator: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
