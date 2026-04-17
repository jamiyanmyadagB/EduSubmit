#!/bin/bash

set -e

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

# Configuration
NAMESPACE="edusubmit-staging"
DEPLOYMENT_NAME="self-healing-test"
SERVICE_NAME="self-healing-test-service"

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info > /dev/null 2>&1; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_info "kubectl is available and cluster is accessible"
}

# Function to deploy test application
deploy_test_app() {
    log_step "Deploying self-healing test application..."
    
    kubectl apply -f k8s/staging/self-healing-test.yaml
    
    log_info "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=120s
    
    log_info "Deployment is ready"
}

# Function to show initial state
show_initial_state() {
    log_step "Showing initial pod state..."
    
    echo "=== Initial Pod Status ==="
    kubectl get pods -n $NAMESPACE -l app=self-healing-test -o wide
    
    echo "=== Deployment Status ==="
    kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o wide
    
    echo "=== Service Status ==="
    kubectl get service $SERVICE_NAME -n $NAMESPACE -o wide
}

# Function to get pod list
get_pod_list() {
    kubectl get pods -n $NAMESPACE -l app=self-healing-test -o jsonpath='{.items[*].metadata.name}'
}

# Function to kill a pod
kill_pod() {
    log_step "Manually deleting a pod to test self-healing..."
    
    local pod_list=($(get_pod_list))
    
    if [ ${#pod_list[@]} -eq 0 ]; then
        log_error "No pods found for deployment $DEPLOYMENT_NAME"
        exit 1
    fi
    
    local target_pod=${pod_list[0]}
    log_info "Target pod to delete: $target_pod"
    
    echo "=== Pod Details Before Deletion ==="
    kubectl describe pod $target_pod -n $NAMESPACE
    
    log_info "Deleting pod: $target_pod"
    kubectl delete pod $target_pod -n $NAMESPACE
    
    log_info "Pod deletion command executed"
}

# Function to monitor self-healing
monitor_self_healing() {
    log_step "Monitoring self-healing process..."
    
    log_info "Waiting for new pod to be created..."
    sleep 10
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "=== Check Attempt $attempt/$max_attempts ==="
        
        local pod_list=($(get_pod_list))
        local pod_count=${#pod_list[@]}
        
        echo "Current pod count: $pod_count"
        echo "Pod list: ${pod_list[*]}"
        
        if [ $pod_count -eq 3 ]; then
            log_info "✅ Self-healing successful! All 3 pods are running"
            
            echo "=== Final Pod Status ==="
            kubectl get pods -n $NAMESPACE -l app=self-healing-test -o wide
            
            echo "=== Deployment Events ==="
            kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep self-healing-test | tail -10
            
            return 0
        fi
        
        echo "Waiting for pod recreation... ($attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_error "❌ Self-healing test failed - pods did not recover within expected time"
    return 1
}

# Function to test pod health
test_pod_health() {
    log_step "Testing pod health after recovery..."
    
    local pod_list=($(get_pod_list))
    local healthy_pods=0
    
    for pod in "${pod_list[@]}"; do
        echo "Checking health of pod: $pod"
        
        local status=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
        local ready=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
        
        echo "Pod $pod - Status: $status, Ready: $ready"
        
        if [ "$status" = "Running" ] && [ "$ready" = "True" ]; then
            healthy_pods=$((healthy_pods + 1))
        fi
    done
    
    log_info "Healthy pods: $healthy_pods/${#pod_list[@]}"
    
    if [ $healthy_pods -eq ${#pod_list[@]} ]; then
        log_info "✅ All pods are healthy"
        return 0
    else
        log_warn "⚠️ Some pods are not healthy"
        return 1
    fi
}

# Function to cleanup test resources
cleanup() {
    log_step "Cleaning up test resources..."
    
    kubectl delete -f k8s/staging/self-healing-test.yaml --ignore-not-found=true
    
    log_info "Test resources cleaned up"
}

# Function to generate test report
generate_report() {
    log_step "Generating test report..."
    
    local report_file="self-healing-test-report-$(date +%Y%m%d-%H%M%S).log"
    
    {
        echo "=== Self-Healing Test Report ==="
        echo "Test Date: $(date)"
        echo "Namespace: $NAMESPACE"
        echo "Deployment: $DEPLOYMENT_NAME"
        echo ""
        echo "=== Test Results ==="
        echo "✅ Deployment created successfully"
        echo "✅ Pod deletion executed"
        echo "✅ Self-healing completed"
        echo "✅ All pods are healthy"
        echo ""
        echo "=== Final Pod Status ==="
        kubectl get pods -n $NAMESPACE -l app=self-healing-test -o wide
        echo ""
        echo "=== Cluster Info ==="
        kubectl cluster-info
    } > $report_file
    
    log_info "Test report saved to: $report_file"
}

# Main test function
main() {
    log_info "Starting Kubernetes Self-Healing Test"
    log_info "Namespace: $NAMESPACE"
    log_info "Deployment: $DEPLOYMENT_NAME"
    
    # Set up error handling
    trap 'log_error "Test failed at line $LINENO"; cleanup; exit 1' ERR
    
    # Pre-test checks
    check_kubectl
    
    # Deploy test application
    deploy_test_app
    
    # Show initial state
    show_initial_state
    
    # Wait for pods to stabilize
    log_info "Waiting 30 seconds for pods to stabilize..."
    sleep 30
    
    # Execute pod deletion
    kill_pod
    
    # Monitor self-healing
    monitor_self_healing
    
    # Test pod health
    test_pod_health
    
    # Generate report
    generate_report
    
    # Cleanup
    cleanup
    
    log_info "🎉 Self-healing test completed successfully!"
}

# Parse command line arguments
case "${1:-run}" in
    "run")
        main
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        kubectl get pods -n $NAMESPACE -l app=self-healing-test -o wide
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [run|cleanup|status|help]"
        echo "  run      - Run the complete self-healing test (default)"
        echo "  cleanup  - Clean up test resources"
        echo "  status   - Show current pod status"
        echo "  help     - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
