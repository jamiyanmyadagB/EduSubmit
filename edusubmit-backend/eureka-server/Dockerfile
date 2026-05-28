FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY target/eureka-server-0.0.1-SNAPSHOT.jar app.jar

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx128m -Xms64m"

EXPOSE 8761

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]