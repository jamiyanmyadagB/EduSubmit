# 🚀 Development Setup Guide

## Quick Start - Run Both Frontend & Backend Simultaneously

### Option 1: One-Command Setup (Recommended)

```bash
# 1. Install all dependencies (frontend + backend)
npm run install:all

# 2. Start both services simultaneously
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080  
- **Auth Service**: http://localhost:8082
- **Assignment Service**: http://localhost:8081

### Option 2: Docker (Easiest)

```bash
# Start all services with Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

### Option 3: Manual Setup

#### Terminal 1 - Backend
```bash
cd edusubmit-backend
mvn spring-boot:run -pl api-gateway,auth-service,assignment-service
```

#### Terminal 2 - Frontend  
```bash
cd edusubmit-frontend
npm start
```

---

## 📦 Available Scripts

From root directory (`d:\6th semester\Project6thSem`):

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only (port 3000)
npm run dev:backend      # Backend only (ports 8080,8081,8082)
npm run install:all       # Install all dependencies
npm run install:frontend  # Install frontend deps only
npm run install:backend   # Build backend services only
npm run build:frontend   # Build for production
npm run build:backend    # Build backend JAR files
npm run docker:up        # Start with Docker
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|-------|--------|----------|
| Student | student@gmail.com | 123 |
| Teacher | teacher@gmail.com | 123 |
| Admin | admin@gmail.com | 123 |

---

## 🐛 Common Issues & Solutions

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Maven Build Issues?
```bash
cd edusubmit-backend
mvn clean install -DskipTests
```

### Frontend Not Loading?
```bash
cd edusubmit-frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues?
- Use Docker: `npm run docker:up`
- Or manually start MySQL service

---

## 📱 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| API Gateway | http://localhost:8080 | 8080 |
| Auth Service | http://localhost:8082 | 8082 |
| Assignment Service | http://localhost:8081 | 8081 |
| Eureka | http://localhost:8761 | 8761 |

---

## 🛠️ Development Features

### Hot Reload
- **Frontend**: Auto-reloads on file changes
- **Backend**: Auto-restarts with Spring Boot DevTools

### Mock Data
- Frontend uses mock data when backend is not available
- Easy to test without full backend setup

### Error Handling
- Graceful fallbacks for API failures
- Clear error messages and loading states

---

## 🎯 Quick Test

1. Run `npm run install:all`
2. Run `npm run dev` 
3. Open http://localhost:3000
4. Login with `student@gmail.com` / `123`
5. Explore the student dashboard!

That's it! 🚀
