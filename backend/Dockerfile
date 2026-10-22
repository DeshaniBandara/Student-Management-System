# Stage 1: Build කරන්න (Maven පාවිච්චි කරලා)
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Dependencies ටික බාගන්නවා (මේකෙන් Build එක fast වෙනවා)
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run කරන්න (JRE විතරක් පාවිච්චි කරලා Image එක පොඩි කරනවා)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]