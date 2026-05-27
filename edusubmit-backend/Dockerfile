FROM maven:3.8-openjdk-17 AS build
WORKDIR /app

COPY . .

RUN mvn clean install -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=build /app/api-gateway/target/*.jar api-gateway.jar
COPY --from=build /app/auth-service/target/*.jar auth.jar
COPY --from=build /app/assignment-service/target/*.jar assignment.jar
COPY --from=build /app/eureka-server/target/*.jar eureka.jar

EXPOSE 8080 8081 8082 8761

CMD ["echo", "Build complete - use docker-compose to run services"]