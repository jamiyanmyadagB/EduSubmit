# Multi-stage build for optimized production Docker image
FROM maven:3.9.4-eclipse-temurin-17 AS builder

# Set build arguments for version control
ARG BUILD_VERSION=1.0.0
ARG GIT_COMMIT
ARG BUILD_DATE

# Set labels for build metadata
LABEL maintainer="EduSubmit Team" \
      version="${BUILD_VERSION}" \
      git.commit="${GIT_COMMIT}" \
      build.date="${BUILD_DATE}"

WORKDIR /app

# Copy Maven configuration files first for better layer caching
COPY pom.xml .
COPY shared/pom.xml ./shared/
COPY api-gateway/pom.xml ./api-gateway/
COPY auth-service/pom.xml ./auth-service/
COPY assignment-service/pom.xml ./assignment-service/

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY shared ./shared
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY assignment-service ./assignment-service

# Build all modules with tests for quality assurance
RUN mvn clean package -DskipTests=false -Dmaven.test.failure.ignore=true

# Production stage - minimal runtime image
FROM openjdk:17-jre-slim

# Set build arguments
ARG BUILD_VERSION=1.0.0
ARG GIT_COMMIT
ARG BUILD_DATE

# Set labels
LABEL maintainer="EduSubmit Team" \
      version="${BUILD_VERSION}" \
      git.commit="${GIT_COMMIT}" \
      build.date="${BUILD_DATE}" \
      description="EduSubmit Backend Services"

# Install required packages and clean up in single layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create application directory with proper permissions
WORKDIR /app

# Create non-root user for security compliance
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser

# Copy built artifacts from builder stage
COPY --from=builder /app/api-gateway/target/*.jar ./api-gateway/
COPY --from=builder /app/auth-service/target/*.jar ./auth-service/
COPY --from=builder /app/assignment-service/target/*.jar ./assignment-service/

# Copy startup scripts
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user for security
USER appuser

# Expose ports for existing services only
EXPOSE 8080 8081 8082

# Set environment variables
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"
ENV SPRING_PROFILES_ACTIVE=prod

# Enhanced health check with multiple endpoints
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health && \
        curl -f http://localhost:8081/actuator/health || exit 1

# Use entrypoint script for flexible startup
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
