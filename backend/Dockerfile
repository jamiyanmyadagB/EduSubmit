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

# Copy source code
COPY src ./src

# Build the project
RUN mvn clean package -DskipTests

# Production stage - minimal runtime image
FROM eclipse-temurin:17-jre-alpine

# Set build arguments
ARG BUILD_VERSION=1.0.0
ARG GIT_COMMIT
ARG BUILD_DATE

# Set labels
LABEL maintainer="EduSubmit Team" \
      version="${BUILD_VERSION}" \
      git.commit="${GIT_COMMIT}" \
      build.date="${BUILD_DATE}" \
      description="EduSubmit Backend"

# Install required packages and clean up in single layer
RUN apk update && \
    apk add --no-cache \
        curl \
        ca-certificates \
        bash \
    && rm -rf /var/cache/apk/*

# Create application directory with proper permissions
WORKDIR /app

# Create non-root user for security compliance
RUN addgroup -S appuser && adduser -S -G appuser -s /bin/false appuser

# Copy built artifacts from builder stage
COPY --from=builder /app/target/*.jar ./app.jar

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user for security
USER appuser

# Expose ports
EXPOSE 8080

# Set environment variables
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"
ENV SPRING_PROFILES_ACTIVE=prod

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start the application
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
