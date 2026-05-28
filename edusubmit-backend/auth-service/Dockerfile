FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# The exact filename confirmed by your 'ls' output
COPY auth-service/target/auth-service-1.0.0.jar app.jar

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx128m -Xms64m"

EXPOSE 8081

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]