#!/bin/bash

# EduSubmit Backend Startup Script
# Author: Senior DevOps Engineer
# Description: Centralized startup script for all infrastructure and services

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header "EDUSUBMIT BACKEND STARTUP"

# 1. VERIFY ENVIRONMENT
print_status "Step 1: Verifying environment..."

# Check Java
if ! command -v java &> /dev/null; then
    print_error "Java is not installed or not in PATH"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
print_status "Java version: $JAVA_VERSION"

# Check Maven
if ! command -v mvn &> /dev/null; then
    print_error "Maven is not installed or not in PATH"
    exit 1
fi

MVN_VERSION=$(mvn -version | head -n 1)
print_status "Maven version: $MVN_VERSION"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
print_status "Docker version: $DOCKER_VERSION"

# 2. VERIFY DOCKER DAEMON RUNNING
print_status "Step 2: Verifying Docker daemon..."

if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_status "Docker daemon is running"

# 3. START REDIS CONTAINER
print_status "Step 3: Starting Redis infrastructure..."

# Check if Redis container already exists
REDIS_CONTAINER=$(docker ps -q -f name=redis)

if [ -n "$REDIS_CONTAINER" ]; then
    print_status "Redis container already running"
else
    # Check if Redis container exists but is stopped
    REDIS_STOPPED=$(docker ps -a -q -f name=redis)
    
    if [ -n "$REDIS_STOPPED" ]; then
        print_status "Starting existing Redis container..."
        docker start redis
    else
        print_status "Creating new Redis container..."
        docker run -d --name redis -p 6379:6379 redis
    fi
fi

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
sleep 3

# Verify Redis is running
if ! docker ps -q -f name=redis; then
    print_error "Redis container failed to start"
    exit 1
fi

print_status "Redis is running on port 6379"

# 4. START EUREKA SERVER
print_status "Step 4: Starting Eureka Server..."

# Navigate to eureka-server directory
cd eureka-server

# Start Eureka in background
print_status "Starting Eureka Server in background..."
nohup mvn spring-boot:run > ../logs/eureka.log 2>&1 &
EUREKA_PID=$!

# Store PID for later cleanup
echo $EUREKA_PID > ../pids/eureka.pid

print_status "Eureka Server starting with PID: $EUREKA_PID"

# Wait for Eureka to start
print_status "Waiting for Eureka Server to be ready..."
sleep 15

# Verify Eureka is accessible
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8761 > /dev/null; then
        print_status "Eureka Server is ready"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        print_warning "Eureka not ready yet, retrying... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 5
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Eureka Server failed to start within timeout"
    exit 1
fi

# 5. START API GATEWAY
print_status "Step 5: Starting API Gateway..."

# Navigate to api-gateway directory
cd ../api-gateway

# Start API Gateway in background
print_status "Starting API Gateway in background..."
nohup mvn spring-boot:run > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!

# Store PID for later cleanup
echo $GATEWAY_PID > ../pids/gateway.pid

print_status "API Gateway starting with PID: $GATEWAY_PID"

# Wait for API Gateway to start
print_status "Waiting for API Gateway to be ready..."
sleep 20

# Verify API Gateway health
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8080/actuator/health > /dev/null; then
        print_status "API Gateway is ready"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        print_warning "API Gateway not ready yet, retrying... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 5
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "API Gateway failed to start within timeout"
    exit 1
fi

# 6. RUN PROJECT BUILD
print_status "Step 6: Running project build..."

# Navigate to project root
cd ..

# Clean and install project
print_status "Building project..."
mvn clean install -DskipTests

if [ $? -ne 0 ]; then
    print_error "Project build failed"
    exit 1
fi

print_status "Project build completed successfully"

# 7. VERIFICATION
print_status "Step 7: Verifying all services..."

# Check Redis health
print_status "Verifying Redis connection..."
REDIS_HEALTH=$(curl -s http://localhost:6379 2>/dev/null || echo "FAILED")
if [ "$REDIS_HEALTH" != "FAILED" ]; then
    print_status "✅ Redis is healthy"
else
    print_warning "⚠️  Redis connection issue detected"
fi

# Check Eureka health
print_status "Verifying Eureka Server..."
if curl -s http://localhost:8761 > /dev/null; then
    print_status "✅ Eureka Server is healthy"
else
    print_warning "⚠️  Eureka Server connection issue detected"
fi

# Check API Gateway health
print_status "Verifying API Gateway..."
GATEWAY_HEALTH=$(curl -s http://localhost:8080/actuator/health 2>/dev/null || echo "FAILED")
if [ "$GATEWAY_HEALTH" != "FAILED" ]; then
    print_status "✅ API Gateway is healthy"
else
    print_warning "⚠️  API Gateway health check failed"
fi

# Check service registration in Eureka
print_status "Verifying service registration..."
EUREKA_APPS=$(curl -s http://localhost:8761/eureka/apps 2>/dev/null || echo "FAILED")
if echo "$EUREKA_APPS" | grep -q "API-GATEWAY"; then
    print_status "✅ API Gateway registered with Eureka"
else
    print_warning "⚠️  API Gateway not registered with Eureka"
fi

# 8. FINAL SUCCESS
print_header "STARTUP COMPLETED"

echo -e "${GREEN}✅ All services started successfully!${NC}"
echo -e "${BLUE}Services Status:${NC}"
echo -e "  Redis:        ${GREEN}RUNNING${NC} (port 6379)"
echo -e "  Eureka Server: ${GREEN}RUNNING${NC} (port 8761)"
echo -e "  API Gateway:  ${GREEN}RUNNING${NC} (port 8080)"
echo ""
echo -e "${BLUE}Access Points:${NC}"
echo -e "  Eureka Dashboard: http://localhost:8761"
echo -e "  API Gateway Health: http://localhost:8080/actuator/health"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Eureka:       logs/eureka.log"
echo -e "  API Gateway:   logs/gateway.log"
echo ""
echo -e "${BLUE}Process IDs:${NC}"
echo -e "  Eureka PID:   $EUREKA_PID (saved in pids/eureka.pid)"
echo -e "  Gateway PID:   $GATEWAY_PID (saved in pids/gateway.pid)"

# Return to original directory
cd -

print_status "Startup script completed successfully!"
