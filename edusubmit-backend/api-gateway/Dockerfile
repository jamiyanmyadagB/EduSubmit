# If you are building inside Docker, make sure you use the bootable target
FROM maven:3.9-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
# Make sure you copy the heavy fat jar, not a thin layer or the wrong service's jar
COPY target/api-gateway-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]