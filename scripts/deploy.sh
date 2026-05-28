#!/bin/bash

set -e

# EduSubmit Production Deployment Script for edusubmit.com
# This script deploys the current version to production

# Configuration
DOMAIN="edusubmit.com"
WWW_DOMAIN="www.edusubmit.com"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
    log_info "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    log_info "Docker Compose is available"
}

# Function to check environment variables
check_env_vars() {
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env file not found, using default values"
        return
    fi
    
    log_info "Checking required environment variables..."
    required_vars=("MYSQL_ROOT_PASSWORD" "MYSQL_DATABASE" "MYSQL_USER" "MYSQL_PASSWORD" "JWT_SECRET")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            log_warn "Environment variable $var is not set in .env file"
        fi
    done
}

# Function to build backend
build_backend() {
    log_step "Building backend services..."
    cd "$PROJECT_DIR/edusubmit-backend"
    
    if mvn clean package -DskipTests; then
        log_info "Backend build successful"
    else
        log_error "Backend build failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to build frontend
build_frontend() {
    log_step "Building frontend..."
    cd "$PROJECT_DIR/edusubmit-frontend"
    
    if npm install && npm run build; then
        log_info "Frontend build successful"
    else
        log_error "Frontend build failed"
        log_warn "Continuing with deployment (frontend may have issues)"
    fi
    
    cd - > /dev/null
}

# Function to stop existing containers
stop_containers() {
    log_step "Stopping existing containers..."
    cd "$PROJECT_DIR"
    
    if docker compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans; then
        log_info "Containers stopped successfully"
    else
        log_warn "Some containers may not have been running"
    fi
}

# Function to build Docker images
build_images() {
    log_step "Building Docker images..."
    cd "$PROJECT_DIR"
    
    if docker compose -f "$DOCKER_COMPOSE_FILE" build; then
        log_info "Docker images built successfully"
    else
        log_error "Docker image build failed"
        exit 1
    fi
}

# Function to start containers
start_containers() {
    log_step "Starting containers..."
    cd "$PROJECT_DIR"
    
    if docker compose -f "$DOCKER_COMPOSE_FILE" up -d; then
        log_info "Containers started successfully"
    else
        log_error "Failed to start containers"
        exit 1
    fi
}

# Function to wait for services to be healthy
wait_for_health() {
    log_step "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local healthy=true
        
        # Check MySQL
        if ! docker compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysqladmin ping -h localhost -u edusubmit_user -pedusubmit_password > /dev/null 2>&1; then
            healthy=false
        fi
        
        # Check Redis
        if ! docker compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; then
            healthy=false
        fi
        
        # Check API Gateway
        if ! curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            healthy=false
        fi
        
        # Check Auth Service
        if ! curl -f -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
            healthy=false
        fi
        
        if [ "$healthy" = true ]; then
            log_info "All services are healthy"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_info "Waiting for services... (attempt $attempt/$max_attempts)"
        sleep 10
    done
    
    log_error "Services did not become healthy within expected time"
    return 1
}

# Function to verify deployment
verify_deployment() {
    log_step "Verifying deployment..."
    
    # Check if frontend is accessible
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "✓ Frontend is accessible"
    else
        log_warn "✗ Frontend may not be accessible"
    fi
    
    # Check if API Gateway is accessible
    if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_info "✓ API Gateway is accessible"
    else
        log_error "✗ API Gateway is not accessible"
        return 1
    fi
    
    # Check if Auth Service is accessible
    if curl -f -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
        log_info "✓ Auth Service is accessible"
    else
        log_error "✗ Auth Service is not accessible"
        return 1
    fi
    
    log_info "Deployment verification completed"
}

# Function to show container status
show_status() {
    log_step "Container status:"
    cd "$PROJECT_DIR"
    docker compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Function to show logs
show_logs() {
    log_step "Recent logs:"
    cd "$PROJECT_DIR"
    docker compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
}

# Main deployment function
main() {
    log_info "Starting EduSubmit Production Deployment"
    log_info "Domain: $DOMAIN"
    log_info "Project Directory: $PROJECT_DIR"
    
    # Pre-deployment checks
    check_docker
    check_docker_compose
    check_env_vars
    
    # Build applications
    build_backend
    build_frontend
    
    # Deploy
    stop_containers
    build_images
    start_containers
    
    # Post-deployment verification
    wait_for_health
    verify_deployment
    show_status
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Application is now accessible at: https://$DOMAIN"
    log_info "To view logs, run: ./scripts/logs.sh"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-build      Skip building applications"
            echo "  --skip-frontend  Skip frontend build"
            echo "  --help, -h       Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
