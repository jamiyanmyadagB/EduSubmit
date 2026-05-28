# Use a lightweight JRE image
FROM eclipse-temurin:17-jre-alpine

# Install netcat for the wait-for-service script logic
RUN apk add --no-cache netcat-openbsd

# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file built by Maven
# Ensure this matches the exact filename: api-gateway-1.0.0.jar
COPY api-gateway/target/api-gateway-1.0.0.jar app.jar

# Copy your entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx128m -Xms64m"

# Expose the port the gateway listens on
EXPOSE 8080

# Use the entrypoint script to start the application
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]