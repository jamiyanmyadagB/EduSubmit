#!/bin/bash

echo "🚀 Building API Gateway with Docker..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t edusubmit/api-gateway:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
    echo "🔥 Starting API Gateway with Docker..."
    
    # Run with Docker
    docker run -d \
        --name edusubmit-api-gateway \
        -p 8080:8080 \
        -e SPRING_PROFILES_ACTIVE=staging \
        -e SERVICE_TO_START=api-gateway \
        -e EUREKA_CLIENT_SERVICE_URL=http://eureka-staging:8761/eureka \
        -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/edusubmit_staging \
        -e SPRING_DATASOURCE_USERNAME=staging_user \
        -e SPRING_DATASOURCE_PASSWORD=staging_password \
        -e SPRING_REDIS_HOST=redis \
        -e SPRING_REDIS_PORT=6379 \
        -e APP_JWT_SECRET=staging_jwt_secret_key_12345 \
        --network edusubmit-backend_edusubmit-network \
        edusubmit/api-gateway:latest
    
    echo "📍 API Gateway is starting at: http://localhost:8080"
    echo "📍 Health check: http://localhost:8080/actuator/health"
    echo "🔍 Check logs with: docker logs edusubmit-api-gateway"
else
    echo "❌ Docker build failed"
    exit 1
fi
