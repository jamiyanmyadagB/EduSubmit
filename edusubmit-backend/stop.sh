#!/bin/bash

echo "🛑 Stopping EduSubmit Application..."

# Stop and remove Docker containers
echo "📦 Stopping Docker containers..."
if command -v docker &> /dev/null; then
    docker compose -f docker-compose.staging.yml down
    
    # Remove any orphaned containers
    echo "🧹 Removing orphaned containers..."
    docker container prune -f
    
    # Remove unused Docker networks
    echo "🌐 Removing unused networks..."
    docker network prune -f
    
    # Remove Docker volumes (optional - uncomment if you want to delete data)
    # echo "🗄️  Removing Docker volumes..."
    # docker volume prune -f
else
    echo "⚠️  Docker not found, skipping Docker cleanup"
fi

# Stop any running Java processes (API Gateway)
echo "🔥 Stopping Java processes..."
pkill -f "api-gateway" 2>/dev/null || true
pkill -f "spring-boot" 2>/dev/null || true

# Clean up Maven build artifacts
echo "🧹 Cleaning build artifacts..."
if [ -d "api-gateway/target" ]; then
    rm -rf api-gateway/target
    echo "✅ Cleaned api-gateway/target"
fi

if [ -d "auth-service/target" ]; then
    rm -rf auth-service/target
    echo "✅ Cleaned auth-service/target"
fi

if [ -d "shared/target" ]; then
    rm -rf shared/target
    echo "✅ Cleaned shared/target"
fi

# Remove temporary files
echo "🗑️  Removing temporary files..."
find . -name "*.log" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "hs_err_pid*.log" -delete 2>/dev/null || true
find . -name "replay_pid*.log" -delete 2>/dev/null || true

# Check if everything is stopped
echo ""
echo "🔍 Checking status..."

# Check Docker containers
if docker ps -q | grep -q .; then
    echo "⚠️  Some Docker containers are still running:"
    docker ps
else
    echo "✅ All Docker containers stopped"
fi

# Check Java processes
if pgrep -f "java" > /dev/null; then
    echo "⚠️  Some Java processes are still running:"
    pgrep -f "java" | head -5
else
    echo "✅ All Java processes stopped"
fi

echo ""
echo "🎉 EduSubmit application stopped successfully!"
echo ""
echo "📋 To restart the application:"
echo "   1. Start infrastructure: docker compose -f docker-compose.staging.yml up -d mysql redis"
echo "   2. Start API Gateway: cd api-gateway && java -jar target/api-gateway-1.0.0.jar"
