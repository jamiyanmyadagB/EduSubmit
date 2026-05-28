FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy built jar into a stable name expected by docker-entrypoint.sh
# NOTE: docker-entrypoint.sh starts /app/app.jar (it ignores module subfolder names)
COPY target/assignment-service-1.0.0.jar app.jar

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx256m -Xms128m"

EXPOSE 8082

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

