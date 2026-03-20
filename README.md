# 📚 EduSubmit
AI-Powered Student Assignment Submission & Academic Management Portal

Jamiyanmyadag Baatar · Reg: 12325947 · Section 323DV · B.Tech CSE DevOps · 2026–27

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

## Tech Stack
Java 17, Spring Boot 3, React.js, MySQL 8, Python Flask,
Docker, GitHub Actions, AWS EC2, Prometheus, Grafana, SonarQube, HashiCorp Vault

---

## Quick Start
1. Clone the repo
2. Copy .env.example to .env and fill in your credentials
3. Run: docker-compose up --build
4. Frontend runs on localhost:3000
5. Backend API runs on localhost:8080
6. AI Engine runs on localhost:5000
7. Grafana runs on localhost:3001

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
