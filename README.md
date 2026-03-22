# EduSubmit

AI-powered academic portal for assignment submission and grading.

**Jamiyanmyadag Baatar · B.Tech CSE DevOps**

---

## 🚀 Quick Start

```bash
git clone https://github.com/jamiyanmyadagB/EduSubmit
cd EduSubmit
docker-compose up -d
```

Visit **http://localhost:3000** to get started.

---

## ✨ Key Features

- **🔐 Secure Authentication** - JWT-based role access (Student/Teacher/Admin)
- **📝 Smart Submissions** - AI-powered grading & plagiarism detection
- **⏰ Deadline Management** - Automatic late submission handling
- **📊 Real-time Analytics** - Live dashboards for assignments & exams
- **🛡️ Enterprise Security** - OWASP security scanning & monitoring

---

## 🏗️ Architecture

```
Frontend (React) → API Gateway → Microservices → Database
     ↓                ↓           ↓              ↓
   UI/UX          Auth/Grade   Spring Boot     MySQL
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend  | React.js, TypeScript |
| Backend   | Java 17, Spring Boot 3 |
| Database  | MySQL 8, Redis |
| Infrastructure | Docker, Kubernetes |
| Monitoring | Prometheus, Grafana |

---

## 📁 Project Structure

```
edusubmit-backend/     # Spring Boot microservices
edusubmit-frontend/    # React application
k8s/                   # Kubernetes manifests
monitoring/            # Prometheus & Grafana
.github/workflows/     # CI/CD pipeline
```

---

## 🚦 Deployment

**Development:** `docker-compose up -d`  
**Production:** `kubectl apply -f k8s/production/`

---

## 📖 Documentation

- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

---

*Built with ☕ by Jamiyanmyadag Baatar*
