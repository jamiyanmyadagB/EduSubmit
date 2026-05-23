# Multi-stage build for Python AI Engine
# Stage 1: Builder - Install dependencies and build application
FROM python:3.11-slim AS builder

# Set build arguments for version control
ARG BUILD_VERSION=1.0.0
ARG GIT_COMMIT
ARG BUILD_DATE

# Set labels for build metadata
LABEL maintainer="EduSubmit Team" \
      version="${BUILD_VERSION}" \
      git.commit="${GIT_COMMIT}" \
      build.date="${BUILD_DATE}"

# Set working directory
WORKDIR /app

# Copy requirements file first for better layer caching
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir reduces image size by not caching downloaded packages
# --upgrade pip ensures we have the latest pip version
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Stage 2: Production - Minimal runtime image
FROM python:3.11-slim

# Set build arguments
ARG BUILD_VERSION=1.0.0
ARG GIT_COMMIT
ARG BUILD_DATE

# Set labels
LABEL maintainer="EduSubmit Team" \
      version="${BUILD_VERSION}" \
      git.commit="${GIT_COMMIT}" \
      build.date="${BUILD_DATE}" \
      description="EduSubmit AI Engine for Grading and Plagiarism Detection"

# Install required system dependencies
# curl is needed for health checks
# gcc and other build tools are needed for some Python packages
RUN apt-get update && \
    apt-get install --no-cache-dir -y \
        curl \
        gcc \
        g++ \
        && rm -rf /var/lib/apt/lists/*

# Create application directory with proper permissions
WORKDIR /app

# Create non-root user for security compliance
# Running as non-root user is a security best practice
RUN addgroup -S appuser && adduser -S -G appuser -s /bin/false appuser

# Copy Python environment and application code from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app /app

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user for security
USER appuser

# Expose port for Flask application
# Default Flask port is 5000
EXPOSE 5000

# Set environment variables
# PYTHONUNBUFFERED ensures Python output is sent directly to terminal (useful for Docker logs)
# FLASK_ENV=production runs Flask in production mode
ENV PYTHONUNBUFFERED=1 \
    FLASK_ENV=production \
    FLASK_APP=app.py \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=5000

# Health check
# Checks if the Flask application is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the Flask application
# Using gunicorn for production-grade WSGI server
# --workers: Number of worker processes (4 is a good starting point)
# --threads: Number of threads per worker
# --bind: Address to bind to
# --timeout: Worker timeout in seconds
# --accesslogfile: Log file for access logs
# --errorlogfile: Log file for error logs
CMD ["gunicorn", "--workers", "4", "--threads", "2", "--bind", "0.0.0.0:5000", "--timeout", "120", "--accesslogfile", "-", "--errorlogfile", "-", "app:app"]
