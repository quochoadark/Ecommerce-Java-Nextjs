---
name: docker-patterns
description: Docker and Docker Compose patterns for local development, container security, networking, and multi-service orchestration.
origin: ECC
---

# Docker Patterns

## When to Activate
- Setting up Docker Compose for local development
- Designing multi-container architectures
- Reviewing Dockerfiles for security and size
- Troubleshooting container networking or volume issues

## Docker Compose — Standard E-Commerce Stack

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./backend/backend-ecommerce
      target: dev
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/ecommerce_dev
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend/backend-ecommerce:/app
      - ~/.m2:/root/.m2  # Maven cache

  frontend:
    build:
      context: ./front-end/front-end-ecommerce
      target: dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080
    volumes:
      - ./front-end/front-end-ecommerce:/app
      - /app/node_modules
      - /app/.next

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ecommerce_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"   # Web UI
      - "1025:1025"   # SMTP

volumes:
  pgdata:
```

## Multi-Stage Dockerfile (Spring Boot)

```dockerfile
# Stage: build
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN ./mvnw dependency:go-offline -q

COPY src src
RUN ./mvnw package -DskipTests -q

# Stage: production (minimal image)
FROM eclipse-temurin:17-jre-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser

COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar

ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Multi-Stage Dockerfile (Next.js)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## Container Security

```yaml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
```

## .dockerignore

```
.git
.env
*.log
target/          # Java build output
node_modules/
.next/
dist/
coverage/
```

## Common Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up --build -d

# View logs
docker compose logs -f backend
docker compose logs --tail=50 db

# Shell into container
docker compose exec backend sh
docker compose exec db psql -U postgres ecommerce_dev

# Stop and remove containers
docker compose down

# Also remove volumes (WARNING: deletes DB data)
docker compose down -v

# Resource usage
docker stats
```

## Anti-Patterns

- Using `:latest` tag — pin to specific versions
- Running as root — always create non-root user
- Storing data in containers without volumes
- Putting secrets in docker-compose.yml (use `.env` or env vars)
- One giant container with all services
