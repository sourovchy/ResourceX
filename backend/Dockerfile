# =============================================================================
# ResourceX Backend — Production Dockerfile
# Multi-stage build for Cloud Run (asia-south1)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build the Spring Boot fat JAR
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk AS build

WORKDIR /workspace

# Copy Maven wrapper + pom.xml first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (cached if pom.xml unchanged)
# Use `sh` to invoke the wrapper — avoids depending on the executable bit,
# which is often lost on Windows checkouts of the repo
RUN sh ./mvnw -B -q dependency:go-offline

# Copy source and build (skip tests — Cloud Build / CI will run them separately)
COPY src ./src
RUN sh ./mvnw -B -q clean package -DskipTests

# -----------------------------------------------------------------------------
# Stage 2: Minimal runtime image (JRE only, non-root)
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre

# Run as non-root for Cloud Run security best practices
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

WORKDIR /app

# Copy the executable fat JAR built in the previous stage
COPY --from=build /workspace/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Cloud Run injects $PORT; default to 8082 to match application.properties fallback
ENV PORT=8082
EXPOSE 8082

# Spring Boot entrypoint — honors $PORT from Cloud Run
# -XX:MaxRAMPercentage=75.0 lets the JVM size itself to Cloud Run's memory limit
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]