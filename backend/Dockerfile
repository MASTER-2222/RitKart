# Multi-stage build for RitZone Backend

# Stage 1: Build the application
FROM maven:3.9.4-openjdk-17-slim AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
FROM openjdk:17-jdk-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r ritzone && useradd -r -g ritzone ritzone

# Copy the built JAR from the build stage
COPY --from=build /app/target/ritzone-backend-*.jar app.jar

# Change ownership to non-root user
RUN chown ritzone:ritzone app.jar

# Switch to non-root user
USER ritzone

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
