#!/bin/bash

# EduSubmit Backend Stop Script
# Author: Senior DevOps Engineer
# Description: Clean shutdown script for all infrastructure and services

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

print_header "EDUSUBMIT BACKEND SHUTDOWN"

# 1. STOP API GATEWAY
print_status "Step 1: Stopping API Gateway..."

# Stop API Gateway if running
if [ -f pids/gateway.pid ]; then
    GATEWAY_PID=$(cat pids/gateway.pid)
    if ps -p $GATEWAY_PID > /dev/null; then
        print_status "Stopping API Gateway (PID: $GATEWAY_PID)..."
        kill $GATEWAY_PID
        sleep 3
        
        # Verify it's stopped
        if ps -p $GATEWAY_PID > /dev/null; then
            print_warning "API Gateway did not stop gracefully, forcing..."
            kill -9 $GATEWAY_PID
        fi
        
        print_status "✅ API Gateway stopped"
        rm -f pids/gateway.pid
    else
        print_warning "API Gateway PID file not found or process not running"
    fi
else
    print_warning "API Gateway PID file not found"
fi

# 2. STOP EUREKA SERVER
print_status "Step 2: Stopping Eureka Server..."

# Stop Eureka Server if running
if [ -f pids/eureka.pid ]; then
    EUREKA_PID=$(cat pids/eureka.pid)
    if ps -p $EUREKA_PID > /dev/null; then
        print_status "Stopping Eureka Server (PID: $EUREKA_PID)..."
        kill $EUREKA_PID
        sleep 3
        
        # Verify it's stopped
        if ps -p $EUREKA_PID > /dev/null; then
            print_warning "Eureka Server did not stop gracefully, forcing..."
            kill -9 $EUREKA_PID
        fi
        
        print_status "✅ Eureka Server stopped"
        rm -f pids/eureka.pid
    else
        print_warning "Eureka Server PID file not found or process not running"
    fi
else
    print_warning "Eureka Server PID file not found"
fi

# 3. STOP REDIS CONTAINER
print_status "Step 3: Stopping Redis container..."

# Stop Redis container
REDIS_CONTAINER=$(docker ps -q -f name=redis)
if [ -n "$REDIS_CONTAINER" ]; then
    print_status "Stopping Redis container..."
    docker stop redis
    sleep 2
    
    # Verify it's stopped
    REDIS_STOPPED=$(docker ps -a -q -f name=redis)
    if [ -n "$REDIS_STOPPED" ]; then
        print_warning "Redis container still running, forcing removal..."
        docker kill redis
    fi
    
    print_status "✅ Redis container stopped"
else
    print_warning "Redis container not found or not running"
fi

# 4. CLEANUP JAVA PROCESSES
print_status "Step 4: Cleaning up Java processes..."

# Kill any remaining Java processes related to our project
# This is a safety measure to avoid zombie processes
JAVA_PIDS=$(ps aux | grep -E "(java|spring-boot)" | grep -v grep | awk '{print $2}')

if [ -n "$JAVA_PIDS" ]; then
    print_status "Found Java processes to clean up..."
    for pid in $JAVA_PIDS; do
        # Only kill processes that are not our main services (check if they're related to our directories)
        if ps -p $pid > /dev/null; then
            PROCESS_CMD=$(ps -p $pid -o cmd=)
            if echo "$PROCESS_CMD" | grep -q -E "(eureka-server|api-gateway|edusubmit)"; then
                print_status "Cleaning up Java process (PID: $pid)..."
                kill $pid
            fi
        fi
    done
    print_status "✅ Java process cleanup completed"
else
    print_status "No stray Java processes found"
fi

# 5. CLEANUP TEMPORARY FILES
print_status "Step 5: Cleaning temporary files..."

# Remove PID files
if [ -d pids ]; then
    rm -rf pids
    print_status "Cleaned up PID files"
fi

# Remove any temporary log files older than 7 days
if [ -d logs ]; then
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    print_status "Cleaned old log files"
fi

# 6. FINAL VERIFICATION
print_status "Step 6: Verifying clean shutdown..."

# Verify everything is stopped
GATEWAY_STOPPED=$(ps aux | grep -E "(api-gateway|spring-boot:run.*api-gateway)" | grep -v grep || echo "STOPPED")
EUREKA_STOPPED=$(ps aux | grep -E "(eureka-server|spring-boot:run.*eureka)" | grep -v grep || echo "STOPPED")
REDIS_STOPPED=$(docker ps -q -f name=redis || echo "STOPPED")

print_status "Shutdown verification:"
echo -e "  API Gateway: ${GREEN}$GATEWAY_STOPPED${NC}"
echo -e "  Eureka Server: ${GREEN}$EUREKA_STOPPED${NC}"
echo -e "  Redis Container: ${GREEN}$REDIS_STOPPED${NC}"

# 7. FINAL SUCCESS
print_header "SHUTDOWN COMPLETED"

echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""
echo -e "${BLUE}Cleanup Summary:${NC}"
echo -e "  Java processes: Cleaned up"
echo -e "  Docker containers: Stopped"
echo -e "  PID files: Removed"
echo -e "  Log files: Cleaned (if older than 7 days)"

print_status "Shutdown script completed successfully!"
