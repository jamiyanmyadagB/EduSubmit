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
npm run install
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
See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

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
