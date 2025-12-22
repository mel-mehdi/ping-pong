all: ssl build up

ssl:
	@echo "🔐 Checking SSL certificates..."
	@if [ ! -f nginx/ssl/nginx.crt ]; then \
		echo "📜 Generating self-signed SSL certificates..."; \
		chmod +x generate-ssl.sh; \
		./generate-ssl.sh; \
	else \
		echo "✅ SSL certificates already exist"; \
	fi

build:
	@echo "🐳 Building Docker containers..."
	docker compose build

up:
	@echo "🚀 Starting services..."
	docker compose up -d
	@sleep 3
	@echo ""
	@echo "✅ Services started!"
	@echo "🌐 Application: https://localhost (HTTPS)"
	@echo "⚠️  Note: Accept the self-signed certificate warning in your browser"
	@echo ""
	@echo "📊 Backend API: https://localhost/api"
	@echo "💬 Frontend: https://localhost"

down:
	@echo "🛑 Stopping services..."
	docker compose down

clean:
	@echo "🧹 Cleaning containers and volumes..."
	docker compose down -v

fclean: clean
	@echo "🧼 Performing full cleanup..."
	docker compose down -v
	docker system prune -af
	docker builder prune -f
	@echo "🗑️  Removing SSL certificates..."
	rm -rf nginx/ssl

re: clean all

logs:
	@echo "📋 Showing logs (Ctrl+C to exit)..."
	docker compose logs -f

restart:
	@echo "♻️  Restarting services..."
	docker compose restart

status:
	@echo "📊 Service status:"
	docker compose ps

.PHONY: all ssl build up down clean fclean re logs restart status
