<<<<<<< HEAD
# EduSubmit - AI-Powered Academic Assignment Portal

A comprehensive, enterprise-grade academic assignment management system built with modern microservices architecture. Students submit assignments, teachers create and grade them, and an AI engine provides automated grading, plagiarism detection, and intelligent help.

## Architecture Overview

```
EduSubmit/
├── Frontend (React 18 + TypeScript + Tailwind CSS)      :3000
├── Backend API (Hono + tRPC + Drizzle ORM + MySQL)      :3000
├── AI Engine (Python Flask + scikit-learn + NLTK)       :5000
├── Prometheus Monitoring                                 :9090
├── Grafana Dashboards                                    :3001
├── ELK Stack (Elasticsearch + Logstash + Kibana)     :9200/5044/5601
└── HashiCorp Vault                                       :8200
```

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- Python 3.10+ (for AI Engine)
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
# Push schema to database
npm run db:push

# Seed default users
npx tsx db/seed.ts
```

### 4. Start Development

```bash
# Terminal 1: Start the AI Engine
cd ai-engine
pip install -r requirements.txt
python app.py

# Terminal 2: Start the main app
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Default Login Credentials

| Role   | Email               | Password |
|--------|---------------------|----------|
| Student| student@gmail.com   | 123      |
| Teacher| teacher@gmail.com   | 123      |
| Admin  | admin@gmail.com     | 123      |

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services Included

| Service        | Port  | Description                     |
|----------------|-------|---------------------------------|
| edusubmit-app  | 3000  | Main application (API + Frontend)|
| ai-engine      | 5000  | AI grading & plagiarism engine  |
| mysql          | 3306  | Database                        |
| redis          | 6379  | Cache                           |
| prometheus     | 9090  | Metrics collection              |
| grafana        | 3001  | Monitoring dashboards           |
| elasticsearch  | 9200  | Log storage                     |
| logstash       | 5044  | Log processing                  |
| kibana         | 5601  | Log visualization               |
| vault          | 8200  | Secret management               |

## Kubernetes Deployment

### Apply manifests

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply config and secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy services
kubectl apply -f k8s/services/

# Deploy applications
kubectl apply -f k8s/deployments/

# Apply ingress and HPA
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### Using ArgoCD

```bash
kubectl apply -f argocd/applications/edusubmit.yaml
```

## API Documentation

### Authentication

| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| POST   | /api/trpc/localAuth.login  | Login with email/password |
| POST   | /api/trpc/localAuth.logout | Logout                   |
| GET    | /api/trpc/localAuth.me     | Get current user         |
| POST   | /api/trpc/localAuth.refresh| Refresh JWT token        |

### Assignments

| Method | Endpoint                              | Access   |
|--------|---------------------------------------|----------|
| POST   | /api/trpc/assignment.create           | TEACHER  |
| GET    | /api/trpc/assignment.list             | Any      |
| GET    | /api/trpc/assignment.getById          | Any      |
| PUT    | /api/trpc/assignment.update           | TEACHER  |
| DELETE | /api/trpc/assignment.delete           | TEACHER  |
| GET    | /api/trpc/assignment.getByTeacher     | Any      |
| GET    | /api/trpc/assignment.getActiveForStudent | STUDENT |

### Submissions

| Method | Endpoint                              | Access   |
|--------|---------------------------------------|----------|
| POST   | /api/trpc/submission.create           | STUDENT  |
| GET    | /api/trpc/submission.getByStudent     | Any      |
| GET    | /api/trpc/submission.getByAssignment  | Any      |
| GET    | /api/trpc/submission.getById          | Any      |
| GET    | /api/trpc/submission.getPending       | TEACHER  |

### Grades

| Method | Endpoint                        | Access   |
|--------|---------------------------------|----------|
| POST   | /api/trpc/grade.create          | TEACHER  |
| GET    | /api/trpc/grade.getBySubmission | Any      |
| GET    | /api/trpc/grade.getByStudent    | Any      |
| PUT    | /api/trpc/grade.update          | TEACHER  |

### Exams

| Method | Endpoint                   | Access   |
|--------|----------------------------|----------|
| POST   | /api/trpc/exam.create      | TEACHER  |
| GET    | /api/trpc/exam.getUpcoming | STUDENT  |
| GET    | /api/trpc/exam.getAll      | Any      |
| PUT    | /api/trpc/exam.update      | TEACHER  |
| DELETE | /api/trpc/exam.delete      | TEACHER  |

### AI Engine

| Method | Endpoint                              | Access |
|--------|---------------------------------------|--------|
| POST   | /api/trpc/ai.grade                    | Any    |
| POST   | /api/trpc/ai.plagiarismCheck          | Any    |
| POST   | /api/trpc/ai.help                     | Any    |

### Admin

| Method | Endpoint                        | Access |
|--------|---------------------------------|--------|
| GET    | /api/trpc/admin.getUsers        | ADMIN  |
| POST   | /api/trpc/admin.createUser      | ADMIN  |
| PUT    | /api/trpc/admin.updateUser      | ADMIN  |
| GET    | /api/trpc/admin.getStats        | ADMIN  |
| GET    | /api/trpc/admin.getAuditLogs    | ADMIN  |
| GET    | /api/trpc/admin.getAlerts       | ADMIN  |

## Features

### Student Dashboard
- View upcoming assignments with deadline tracking
- File upload (PDF, DOCX, ZIP) with validation
- AI-powered help assistant
- Exam schedule viewer
- Grade tracking with feedback

### Teacher Dashboard
- Create and manage assignments
- View student submissions
- Grading panel with AI score suggestions
- Exam schedule management
- Submission analytics

### Admin Dashboard
- User management (CRUD, activate/suspend)
- System monitoring with charts
- Audit log viewer with CSV export
- System alerts and health status
- Role-based access control

### AI Engine
- Automated essay grading
- Plagiarism detection (TF-IDF + cosine similarity)
- Intelligent help assistant
- Grammar and style checking
- Content depth analysis

## Monitoring

### Prometheus
Access at `http://localhost:9090`

Configured scrape targets:
- EduSubmit backend API
- AI Engine
- MySQL exporter
- Redis exporter
- Node exporter

### Grafana
Access at `http://localhost:3001` (admin/admin)

Pre-configured dashboards:
- Application Health (requests, errors, latency)
- Business Metrics (submissions, active users)
- System Resources (CPU, memory, disk)

### Alerts
Alert rules for:
- Service down (critical)
- High error rate > 5% (warning)
- High response time p95 > 1s (warning)
- High memory usage > 85% (warning)
- MySQL down (critical)
- Low disk space < 10% (critical)

## Security

- JWT-based authentication with 24h expiry
- BCrypt password hashing
- Role-based access control (STUDENT/TEACHER/ADMIN)
- Server-side UTC timestamps
- File type and size validation
- Audit logging for all actions
- HashiCorp Vault for secrets (optional)
- HTTPS via cert-manager in Kubernetes

## CI/CD Pipeline

The GitHub Actions pipeline includes:

1. **Backend Tests** - Type check + unit tests with coverage
2. **Frontend Build** - Production build verification
3. **Code Quality** - SonarQube analysis
4. **Security Scan** - Snyk dependency scanning
5. **Docker Build** - Multi-stage image builds
6. **Container Scan** - Trivy vulnerability scanning
7. **Push Images** - DockerHub deployment
8. **Deploy Staging** - Automatic staging deployment
9. **DAST Scan** - OWASP ZAP security testing
10. **Deploy Production** - Manual approval production deployment

## Project Structure

```
EduSubmit/
├── .github/workflows/ci-cd.yml    # CI/CD Pipeline
├── ai-engine/                      # Python AI Engine
│   ├── app.py                      # Flask API
│   ├── requirements.txt            # Python deps
│   └── Dockerfile
├── api/                            # Backend API
│   ├── routers/                    # tRPC routers
│   ├── local-auth.ts               # JWT auth
│   ├── boot.ts                     # Hono server
│   └── middleware.ts               # RBAC middleware
├── db/                             # Database
│   ├── schema.ts                   # Drizzle schema
│   ├── relations.ts                # Table relations
│   └── seed.ts                     # Seed data
├── src/                            # Frontend
│   ├── pages/                      # Dashboard pages
│   │   ├── student/
│   │   ├── teacher/
│   │   └── admin/
│   ├── hooks/useAuth.ts            # Auth hook
│   └── providers/trpc.tsx          # tRPC client
├── k8s/                            # Kubernetes manifests
├── monitoring/                     # Prometheus + Grafana
├── elk/                            # ELK Stack configs
├── terraform/                      # AWS Infrastructure
├── argocd/                         # ArgoCD applications
├── cert-manager/                   # TLS certificates
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open a GitHub issue or contact admin@edusubmit.com.
=======
# EduSubmit
AI-powered academic portal for assignment submission and grading.

Jamiyanmyadag Baatar · Reg: 12325947 · Section 323DV · B.Tech CSE DevOps

---

## About
EduSubmit is a secure, full-stack academic portal that automates the entire assignment lifecycle — submission, AI-powered evaluation, grading, and exam scheduling — for students and teachers.

---

## Features
- JWT authentication with Role-Based Access Control (Student / Teacher / Admin)
- Tamper-proof server-side timestamping — late submissions auto-rejected
- AI engine for auto-grading, plagiarism detection and feedback generation
- Real-time exam schedule dashboard published by faculty
- Prometheus + Grafana monitoring with full audit logging
- Security scanning via OWASP ZAP, Snyk and Trivy in CI pipeline

---

## Quick Start
```bash
git clone https://github.com/jamiyanmyadagB/EduSubmit
cd EduSubmit
npm run install:all
npm run dev
```

## Usage
- Students submit assignments and track deadlines
- Teachers create assignments and grade submissions
- AI-powered evaluation and feedback

## Tech Stack
- Frontend: React.js, TypeScript
- Backend: Java 17, Spring Boot 3
- Database: MySQL 8
- Infrastructure: Docker, Kubernetes

## Development
See individual service README files in backend/ and frontend/ directories for detailed setup instructions.

---

## Project Structure
backend/           - Java Spring Boot REST API
frontend/          - React.js SPA
ai-engine/         - Python Flask NLP and grading
monitoring/        - Prometheus and Grafana config
.github/workflows/ - CI/CD pipeline
docker-compose.yml - runs all services together

---

Made with coffee by Jamiyanmyadag Baatar
>>>>>>> origin/main
