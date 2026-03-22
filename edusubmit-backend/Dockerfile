# Multi-stage build for EduSubmit Backend
FROM maven:3.9.4-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml
COPY pom.xml .
COPY shared ./shared
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY assignment-service ./assignment-service
COPY submission-service ./submission-service
COPY grading-service ./grading-service
COPY notification-service ./notification-service
COPY exam-schedule-service ./exam-schedule-service

# Build all modules
RUN mvn clean install -DskipTests

# Production stage
FROM openjdk:17-jre-slim

# Install required packages
RUN apt-get update && \
    apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder /app/api-gateway/target/*.jar ./api-gateway/
COPY --from=builder /app/auth-service/target/*.jar ./auth-service/
COPY --from=builder /app/assignment-service/target/*.jar ./assignment-service/
COPY --from=builder /app/submission-service/target/*.jar ./submission-service/
COPY --from=builder /app/grading-service/target/*.jar ./grading-service/
COPY --from=builder /app/notification-service/target/*.jar ./notification-service/
COPY --from=builder /app/exam-schedule-service/target/*.jar ./exam-schedule-service/

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 8080 8081 8082 8083 8084 8085 8086

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Default command - can be overridden by docker-compose
CMD ["java", "-jar", "-Dspring.profiles.active=prod", "./api-gateway/edusubmit-api-gateway-1.0.0.jar"]
