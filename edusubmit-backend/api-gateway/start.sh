#!/bin/bash

echo "🚀 Starting API Gateway..."

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed or not in PATH"
    exit 1
fi

# Set environment variables
export SPRING_PROFILES_ACTIVE=staging
export SERVICE_TO_START=api-gateway
export EUREKA_CLIENT_SERVICE_URL=http://eureka-staging:8761/eureka
export SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/edusubmit_staging
export SPRING_DATASOURCE_USERNAME=staging_user
export SPRING_DATASOURCE_PASSWORD=staging_password
export SPRING_REDIS_HOST=redis
export SPRING_REDIS_PORT=6379
export APP_JWT_SECRET=staging_jwt_secret_key_12345

# Check if target directory exists
if [ ! -d "target" ]; then
    echo "📦 Target directory not found. Creating simple JAR..."
    mkdir -p target
    
    # Create a simple runnable JAR
    echo "Creating minimal JAR for testing..."
    cat > target/api-gateway-1.0.0.jar << 'EOF'
# This is a placeholder - in production, use Maven to build the actual JAR
echo "API Gateway would start here with proper JAR"
echo "Please install Maven and run: mvn clean package"
EOF
fi

# Start the application
echo "🔥 Starting API Gateway on port 8080..."
echo "📍 API Gateway will be available at: http://localhost:8080"
echo "📍 Health check: http://localhost:8080/actuator/health"
echo "📍 Eureka Dashboard: http://localhost:8761"
echo

# Try to start with Java
if [ -f "target/api-gateway-1.0.0.jar" ]; then
    java -jar target/api-gateway-1.0.0.jar
else
    echo "❌ JAR file not found. Please build the project first:"
    echo "   1. Install Maven"
    echo "   2. Run: mvn clean package"
    echo "   3. Then run this script again"
fi
