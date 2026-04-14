#!/bin/bash

set -e

# Configuration
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"docker.io"}
IMAGE_NAME=${IMAGE_NAME:-"edusubmit/backend"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
NAMESPACE=${NAMESPACE:-"edusubmit-staging"}
ENVIRONMENT=${ENVIRONMENT:-"staging"}

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

# Function to pull Docker image from registry
pull_docker_image() {
    local full_image="$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    
    log_step "Pulling Docker image: $full_image"
    
    if docker pull "$full_image"; then
        log_info "Successfully pulled Docker image: $full_image"
    else
        log_error "Failed to pull Docker image: $full_image"
        exit 1
    fi
    
    # Verify the image exists locally
    if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "$full_image"; then
        log_info "Docker image verified locally: $full_image"
    else
        log_error "Docker image not found locally after pull: $full_image"
        exit 1
    fi
}

# Function to verify Docker image integrity
verify_docker_image() {
    local full_image="$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    
    log_step "Verifying Docker image integrity"
    
    # Get image details
    local image_id=$(docker images --format "{{.ID}}" "$full_image" | head -1)
    local image_size=$(docker images --format "{{.Size}}" "$full_image" | head -1)
    
    log_info "Image ID: $image_id"
    log_info "Image Size: $image_size"
    
    # Test if the image can run a basic command
    if docker run --rm "$full_image" java -version > /dev/null 2>&1; then
        log_info "Docker image integrity check passed"
    else
        log_error "Docker image integrity check failed"
        exit 1
    fi
}

# Function to deploy using Docker Compose
deploy_with_compose() {
    log_step "Deploying with Docker Compose"
    
    export DOCKER_REGISTRY="$DOCKER_REGISTRY"
    export IMAGE_NAME="$IMAGE_NAME"
    export IMAGE_TAG="$IMAGE_TAG"
    
    # Navigate to backend directory
    cd "$(dirname "$0")/../edusubmit-backend"
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f docker-compose.staging.yml down --remove-orphans || true
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f docker-compose.staging.yml pull
    
    # Start services
    log_info "Starting services..."
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service status
    log_info "Checking service status..."
    docker-compose -f docker-compose.staging.yml ps
    
    cd - > /dev/null
}

# Function to deploy to Kubernetes
deploy_to_kubernetes() {
    log_step "Deploying to Kubernetes"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info > /dev/null 2>&1; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Update image tag in deployments
    log_info "Updating image tag in Kubernetes deployments..."
    kubectl set image deployment/api-gateway api-gateway="$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG" -n "$NAMESPACE"
    kubectl set image deployment/auth-service auth-service="$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG" -n "$NAMESPACE"
    
    # Wait for rollout to complete
    log_info "Waiting for rollout to complete..."
    kubectl rollout status deployment/api-gateway -n "$NAMESPACE" --timeout=300s
    kubectl rollout status deployment/auth-service -n "$NAMESPACE" --timeout=300s
    
    # Show deployment status
    log_info "Deployment status:"
    kubectl get deployments -n "$NAMESPACE"
    kubectl get pods -n "$NAMESPACE"
}

# Function to run smoke tests
run_smoke_tests() {
    log_step "Running smoke tests"
    
    # Run smoke tests script
    if [ -f "$(dirname "$0")/smoke-tests.sh" ]; then
        chmod +x "$(dirname "$0")/smoke-tests.sh"
        "$(dirname "$0")/smoke-tests.sh"
    else
        log_warn "Smoke tests script not found, skipping smoke tests"
    fi
}

# Function to verify deployment
verify_deployment() {
    log_step "Verifying deployment"
    
    # Check if services are responding
    local services=(
        "http://localhost:8080/actuator/health"
        "http://localhost:8081/actuator/health"
        "http://localhost:8761/actuator/health"
    )
    
    for service in "${services[@]}"; do
        log_info "Checking service: $service"
        if curl -f -s --max-time 10 "$service" > /dev/null; then
            log_info "✓ Service is healthy: $service"
        else
            log_error "✗ Service is not responding: $service"
            return 1
        fi
    done
    
    log_info "Deployment verification completed successfully"
}

# Function to rollback on failure
rollback_deployment() {
    log_error "Deployment failed, initiating rollback"
    
    if command -v kubectl &> /dev/null; then
        log_info "Rolling back Kubernetes deployments..."
        kubectl rollout undo deployment/api-gateway -n "$NAMESPACE"
        kubectl rollout undo deployment/auth-service -n "$NAMESPACE"
    fi
    
    if command -v docker-compose &> /dev/null; then
        log_info "Rolling back Docker Compose deployment..."
        cd "$(dirname "$0")/../edusubmit-backend"
        docker-compose -f docker-compose.staging.yml down
        cd - > /dev/null
    fi
}

# Main deployment function
main() {
    log_info "Starting EduSubmit Staging Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Image: $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    
    # Set up error handling
    trap 'log_error "Deployment failed at line $LINENO"; rollback_deployment; exit 1' ERR
    
    # Pre-deployment checks
    check_docker
    
    # Pull and verify Docker image
    pull_docker_image
    verify_docker_image
    
    # Deploy based on available tools
    if command -v kubectl &> /dev/null && kubectl cluster-info > /dev/null 2>&1; then
        deploy_to_kubernetes
    elif command -v docker-compose &> /dev/null; then
        deploy_with_compose
    else
        log_error "Neither kubectl nor docker-compose is available for deployment"
        exit 1
    fi
    
    # Post-deployment verification
    sleep 30  # Give services time to start
    verify_deployment
    run_smoke_tests
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Services are running and healthy"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        --image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --registry    Docker registry (default: docker.io)"
            echo "  --image       Docker image name (default: edusubmit/backend)"
            echo "  --tag         Docker image tag (default: latest)"
            echo "  --namespace   Kubernetes namespace (default: edusubmit-staging)"
            echo "  --environment Environment (default: staging)"
            echo "  --help, -h    Show this help message"
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
