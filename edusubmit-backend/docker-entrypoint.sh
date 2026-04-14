#!/bin/bash

set -e

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local timeout=${4:-60}
    
    echo "Waiting for $service ($host:$port) to be ready..."
    
    for i in $(seq 1 $timeout); do
        if nc -z $host $port; then
            echo "$service is ready!"
            return 0
        fi
        echo "Waiting for $service... ($i/$timeout)"
        sleep 1
    done
    
    echo "Timeout waiting for $service"
    exit 1
}

# Function to check database connectivity
check_database() {
    echo "Checking database connectivity..."
    
    # Wait for MySQL if configured
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_PORT" ]; then
        wait_for_service $DB_HOST $DB_PORT "MySQL Database"
    fi
    
    # Wait for Redis if configured
    if [ ! -z "$REDIS_HOST" ] && [ ! -z "$REDIS_PORT" ]; then
        wait_for_service $REDIS_HOST $REDIS_PORT "Redis Cache"
    fi
}

# Function to set JVM options based on available memory
set_jvm_options() {
    # Calculate memory settings based on container limits
    if [ -f /sys/fs/cgroup/memory/memory.limit_in_bytes ]; then
        local memory_limit=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
        local memory_mb=$((memory_limit / 1024 / 1024))
        
        # Set heap size to 70% of available memory, max 1GB
        local heap_size=$((memory_mb * 70 / 100))
        if [ $heap_size -gt 1024 ]; then
            heap_size=1024
        fi
        
        export JAVA_OPTS="-Xmx${heap_size}m -Xms${heap_size/2}m $JAVA_OPTS"
        echo "Set JVM options: $JAVA_OPTS"
    fi
}

# Function to start a specific service
start_service() {
    local service=$1
    local jar_path="./$service"
    
    if [ -f "$jar_path" ]; then
        echo "Starting $service..."
        exec java $JAVA_OPTS -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar "$jar_path"
    else
        echo "JAR file not found for service: $service"
        exit 1
    fi
}

# Main execution
main() {
    echo "Starting EduSubmit Backend Services..."
    echo "Build Version: ${BUILD_VERSION:-unknown}"
    echo "Git Commit: ${GIT_COMMIT:-unknown}"
    echo "Build Date: ${BUILD_DATE:-unknown}"
    
    # Set JVM options
    set_jvm_options
    
    # Check dependencies
    check_database
    
    # Determine which service to start
    SERVICE_TO_START=${SERVICE_TO_START:-api-gateway}
    
    # Find the JAR file for the service
    case $SERVICE_TO_START in
        "api-gateway")
            start_service "api-gateway/edusubmit-api-gateway-1.0.0.jar"
            ;;
        "auth-service")
            start_service "auth-service/edusubmit-auth-service-1.0.0.jar"
            ;;
        "assignment-service")
            start_service "assignment-service/edusubmit-assignment-service-1.0.0.jar"
            ;;
        "submission-service")
            start_service "submission-service/edusubmit-submission-service-1.0.0.jar"
            ;;
        "grading-service")
            start_service "grading-service/edusubmit-grading-service-1.0.0.jar"
            ;;
        "notification-service")
            start_service "notification-service/edusubmit-notification-service-1.0.0.jar"
            ;;
        "exam-schedule-service")
            start_service "exam-schedule-service/edusubmit-exam-schedule-service-1.0.0.jar"
            ;;
        *)
            echo "Unknown service: $SERVICE_TO_START"
            echo "Available services: api-gateway, auth-service, assignment-service, submission-service, grading-service, notification-service, exam-schedule-service"
            exit 1
            ;;
    esac
}

# Handle signals gracefully
trap 'echo "Received shutdown signal, terminating..."; exit 0' SIGTERM SIGINT

# Run main function
main "$@"
