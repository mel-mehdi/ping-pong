all: build up

build:
	@echo "🐳 Building Docker containers..."
	docker compose build

up:
	@echo "🚀 Starting service..."
	docker compose up -d
	@sleep 2
	@echo ""
	@echo "✅ Service started!"
	@echo "🌐 Application: http://localhost:8000"

down:
	@echo "🛑 Stopping service..."
	docker compose down

clean:
	@echo "🧹 Cleaning everything..."
	docker compose down -v

fclean:
	@echo "🧼 Performing full cleanup..."
	docker compose down -v
	docker system prune -f
	docker volume prune -f
	docker network prune -f
	docker image prune -f
	docker builder prune -f
	docker container prune -f

re: clean all

logs:
	docker compose logs -f

.PHONY: all build up down clean fclean re logs
