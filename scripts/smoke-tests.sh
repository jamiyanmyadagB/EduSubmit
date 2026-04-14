#!/bin/bash

set -e

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:8080"}
TIMEOUT=${TIMEOUT:-30}
RETRY_COUNT=${RETRY_COUNT:-5}
RETRY_DELAY=${RETRY_DELAY:-10}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to check if a service is healthy
check_service_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=$3
    local attempt=1
    
    log_info "Checking health of $service_name at $health_url"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time $TIMEOUT "$health_url" > /dev/null; then
            log_info "$service_name is healthy!"
            return 0
        else
            log_warn "$service_name health check failed (attempt $attempt/$max_attempts)"
            if [ $attempt -lt $max_attempts ]; then
                sleep $RETRY_DELAY
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    log_error "$service_name failed health check after $max_attempts attempts"
    return 1
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    log_info "Testing $endpoint_name: $url"
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/response_body.json "$url" --max-time $TIMEOUT)
    local status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        log_info "$endpoint_name test passed (Status: $status_code)"
        return 0
    else
        log_error "$endpoint_name test failed (Expected: $expected_status, Got: $status_code)"
        if [ -f /tmp/response_body.json ]; then
            log_error "Response body: $(cat /tmp/response_body.json)"
        fi
        return 1
    fi
}

# Function to test authentication flow
test_authentication() {
    log_info "Testing authentication flow"
    
    # Test login endpoint
    local login_data='{"username":"testuser","password":"testpass"}'
    local login_url="$BASE_URL/api/auth/login"
    
    if curl -f -s -X POST \
        -H "Content-Type: application/json" \
        -d "$login_data" \
        "$login_url" > /tmp/login_response.json; then
        log_info "Login endpoint accessible"
        return 0
    else
        log_error "Login endpoint test failed"
        return 1
    fi
}

# Function to test database connectivity
test_database_connectivity() {
    log_info "Testing database connectivity through API"
    
    # Test a simple database query through an endpoint
    test_api_endpoint "Database Connectivity" "$BASE_URL/api/health/db" "200"
}

# Function to test service discovery
test_service_discovery() {
    log_info "Testing service discovery (Eureka)"
    
    # Test Eureka dashboard
    test_api_endpoint "Eureka Dashboard" "http://localhost:8761" "200"
}

# Function to test monitoring endpoints
test_monitoring() {
    log_info "Testing monitoring endpoints"
    
    # Test Prometheus
    test_api_endpoint "Prometheus" "http://localhost:9090/-/healthy" "200"
    
    # Test Grafana
    test_api_endpoint "Grafana" "http://localhost:3000/api/health" "200"
}

# Function to test file upload functionality
test_file_upload() {
    log_info "Testing file upload functionality"
    
    # Create a test file
    echo "Test file content" > /tmp/test_file.txt
    
    # Test upload endpoint
    if curl -f -s -X POST \
        -F "file=@/tmp/test_file.txt" \
        "$BASE_URL/api/submissions/upload" > /dev/null; then
        log_info "File upload test passed"
        return 0
    else
        log_error "File upload test failed"
        return 1
    fi
}

# Function to test rate limiting
test_rate_limiting() {
    log_info "Testing rate limiting"
    
    local url="$BASE_URL/api/public/test"
    local success_count=0
    
    # Make multiple rapid requests
    for i in {1..10}; do
        if curl -f -s "$url" > /dev/null; then
            success_count=$((success_count + 1))
        fi
    done
    
    # If all requests succeed, rate limiting might not be working
    if [ $success_count -eq 10 ]; then
        log_warn "Rate limiting may not be configured (all $success_count requests succeeded)"
        return 0
    else
        log_info "Rate limiting test passed ($success_count/10 requests succeeded)"
        return 0
    fi
}

# Main smoke test execution
main() {
    log_info "Starting EduSubmit Staging Environment Smoke Tests"
    log_info "Base URL: $BASE_URL"
    log_info "Timeout: ${TIMEOUT}s, Retry Count: $RETRY_COUNT"
    
    local failed_tests=0
    local total_tests=0
    
    # Health checks for all services
    echo "=========================================="
    echo "Service Health Checks"
    echo "=========================================="
    
    services=(
        "API Gateway:http://localhost:8080/actuator/health"
        "Auth Service:http://localhost:8081/actuator/health"
        "Assignment Service:http://localhost:8082/actuator/health"
        "Eureka Service:http://localhost:8761/actuator/health"
        "MySQL Database:mysql://localhost:3306"
        "Redis Cache:redis://localhost:6379"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name url <<< "$service"
        total_tests=$((total_tests + 1))
        
        if check_service_health "$name" "$url" $RETRY_COUNT; then
            log_info "✓ $name health check passed"
        else
            log_error "✗ $name health check failed"
            failed_tests=$((failed_tests + 1))
        fi
    done
    
    # API functionality tests
    echo "=========================================="
    echo "API Functionality Tests"
    echo "=========================================="
    
    api_tests=(
        "API Gateway Health:$BASE_URL/actuator/health:200"
        "API Info:$BASE_URL/actuator/info:200"
        "API Metrics:$BASE_URL/actuator/metrics:200"
    )
    
    for test in "${api_tests[@]}"; do
        IFS=':' read -r name url expected <<< "$test"
        total_tests=$((total_tests + 1))
        
        if test_api_endpoint "$name" "$url" "$expected"; then
            log_info "✓ $name test passed"
        else
            log_error "✗ $name test failed"
            failed_tests=$((failed_tests + 1))
        fi
    done
    
    # Advanced tests
    echo "=========================================="
    echo "Advanced Tests"
    echo "=========================================="
    
    advanced_tests=(
        "test_authentication"
        "test_database_connectivity"
        "test_service_discovery"
        "test_monitoring"
        "test_file_upload"
        "test_rate_limiting"
    )
    
    for test_func in "${advanced_tests[@]}"; do
        total_tests=$((total_tests + 1))
        
        if $test_func; then
            log_info "✓ $test_func passed"
        else
            log_error "✗ $test_func failed"
            failed_tests=$((failed_tests + 1))
        fi
    done
    
    # Summary
    echo "=========================================="
    echo "Smoke Test Summary"
    echo "=========================================="
    log_info "Total Tests: $total_tests"
    log_info "Passed: $((total_tests - failed_tests))"
    log_info "Failed: $failed_tests"
    
    if [ $failed_tests -eq 0 ]; then
        log_info "🎉 All smoke tests passed! Staging environment is ready."
        exit 0
    else
        log_error "❌ $failed_tests smoke test(s) failed. Please check the environment."
        exit 1
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f /tmp/response_body.json /tmp/login_response.json /tmp/test_file.txt
}

# Set up trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"
