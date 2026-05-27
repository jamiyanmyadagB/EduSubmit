# EduSubmit - AI-Powered Academic Assignment Portal

A comprehensive, enterprise-grade academic assignment management system built with modern microservices architecture. Students submit assignments, teachers create and grade them, and an AI engine provides automated grading, plagiarism detection, and intelligent help.

## Architecture Overview

EduSubmit/
├── Frontend (React 18 + TypeScript + Tailwind CSS) :3000 (dev server default; frontend not included in this repo)
├── Backend API (Spring Boot microservices via API Gateway) :8080 (api-gateway)
├── Auth Service :8081 (auth-service)
├── Assignment Service :8082 (assignment-service)
├── AI Engine (optional, Flask + scikit-learn + NLTK) :5000 (if run separately)
├── Prometheus Monitoring :9090
├── Grafana Dashboards :3000
├── MinIO (object storage) :9000 (API) / :9001 (console)
├── MySQL :3306
├── Redis :6379
├── Eureka Service Discovery :8761
├── Nginx (production load balancer) :80 / :443
├── ELK Stack (Elasticsearch + Logstash + Kibana) :9200 / :5044 / :5601
└── HashiCorp Vault :8200

Note: These port mappings are taken from `docker-compose.staging.yml` and `docker-compose.prod.yml` in this repository. Adjustments may be necessary if you override environment variables or expose different ports locally.

## Quick Start

### Prerequisites
- Node.js 20+ (if running frontend)
- MySQL 8.0+
- Python 3.10+ (for AI Engine, optional)
- Docker & Docker Compose (optional)

### 1. Clone and Install

```bash
git clone https://github.com/jamiyanmyadagB/EduSubmit.git
cd EduSubmit
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### 3. Database Setup

```bash
# Push schema to database (if using the API tooling)
npm run db:push

# Seed default users
npx tsx db/seed.ts
```

### 4. Start Development

```bash
# Terminal 1: Start the AI Engine (if present / separate)
cd ai-engine
pip install -r requirements.txt
python app.py

# Terminal 2: Start the main app (backend/frontend)
npm run dev
```

Access:
- Frontend (dev): http://localhost:3000 (if you run the frontend dev server)
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081
- Assignment Service: http://localhost:8082
- AI Engine (if running): http://localhost:5000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- MinIO Console: http://localhost:9001
- Eureka: http://localhost:8761
- MySQL: 3306 (DB connection; not an HTTP endpoint)
- Redis: 6379 (TCP)

### 5. Default Login Credentials

| Role   | Email               | Password |
|--------|---------------------|----------|
| Student| student@gmail.com   | 123      |
| Teacher| teacher@gmail.com   | 123      |
| Admin  | admin@gmail.com     | 123      |

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start services defined in the compose file
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f

# Stop all services
docker-compose -f docker-compose.staging.yml down
```

Service ports exposed by the compose files:
- `mysql` : 3306
- `redis` : 6379
- `minio` : 9000 (API), 9001 (console)
- `api-gateway` : 8080
- `auth-service` : 8081
- `assignment-service` : 8082
- `eureka` : 8761
- `prometheus` : 9090
- `grafana` : 3000
- Production also includes nginx on :80 and :443 (see `docker-compose.prod.yml`)

## Kubernetes Deployment

(unchanged — use manifests in `k8s/`)

## AI Engine

(unchanged — if you run the separate AI engine, keep it on :5000 or change as required)

## Monitoring

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (default admin password may be configured in compose files)

## Notes about changing ports

- To change ports for a service, edit the `ports:` mapping in `docker-compose.staging.yml` or `docker-compose.prod.yml`.
- Example: to change API Gateway to host port 8085, update the mapping under `api-gateway`:
  - from `- "8080:8080"` to `- "8085:8080"`
- If you change ports in compose, update any configuration or documentation that assumes the previous ports (frontend proxy, env files, monitoring scrape targets, etc).

## Support

For issues or questions, please open a GitHub issue or contact admin@edusubmit.com.

