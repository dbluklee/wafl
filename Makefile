# WAFL AI POS System - Docker Management
.PHONY: help build up down dev prod logs clean reset health restart scale

# Default target
help:
	@echo "WAFL AI POS System - Available commands:"
	@echo "  make build    - Build all Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make dev      - Start development mode (hot-reload)"
	@echo "  make prod     - Start production mode"
	@echo "  make logs     - Show all logs"
	@echo "  make clean    - Remove volumes"
	@echo "  make reset    - Complete reset (down + clean + build)"
	@echo "  make health   - Check service health"
	@echo "  make migrate  - Run database migrations"
	@echo "  make seed     - Seed database with test data"
	@echo "  make restart service=<name> - Restart specific service"
	@echo "  make scale service=<name> count=<num> - Scale specific service"

# Build all images
build:
	docker-compose -f docker/docker-compose.yml build --parallel

# Start all services
up:
	docker-compose -f docker/docker-compose.yml up -d

# Stop all services
down:
	docker-compose -f docker/docker-compose.yml down

# Development mode with hot reload
dev:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up

# Production mode
prod:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d

# Show logs
logs:
	docker-compose -f docker/docker-compose.yml logs -f

# Show logs for specific service
logs-service:
ifndef service
	@echo "Usage: make logs-service service=<service-name>"
else
	docker-compose -f docker/docker-compose.yml logs -f $(service)
endif

# Remove volumes
clean:
	docker-compose -f docker/docker-compose.yml down -v
	docker system prune -f

# Complete reset
reset: down clean build

# Health check
health:
	@echo "Checking service health..."
	@docker-compose -f docker/docker-compose.yml ps

# Database migrations
migrate:
	docker-compose -f docker/docker-compose.yml exec auth-service npx prisma migrate deploy

# Seed database
seed:
	docker-compose -f docker/docker-compose.yml exec auth-service npm run seed

# Restart specific service
restart:
ifndef service
	@echo "Usage: make restart service=<service-name>"
else
	docker-compose -f docker/docker-compose.yml restart $(service)
endif

# Scale specific service
scale:
ifndef service
	@echo "Usage: make scale service=<service-name> count=<number>"
else
ifndef count
	@echo "Usage: make scale service=<service-name> count=<number>"
else
	docker-compose -f docker/docker-compose.yml up -d --scale $(service)=$(count)
endif
endif

# Install dependencies
install:
	npm install

# Run tests
test:
	npm test

# Lint code
lint:
	npm run lint

# Type check
type-check:
	npm run type-check