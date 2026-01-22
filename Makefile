BLUE = \033[1;34m
GREEN = \033[1;32m
YELLOW = \033[1;33m
RESET = \033[0m

all: setup ssl build up

setup:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  Warning: .env file not found! Copying .env.example...$(RESET)"; \
		cp .env.example .env; \
	fi

ssl:
	@echo "$(BLUE)🔐 Checking SSL certificates...$(RESET)"
	@if [ ! -f nginx/ssl/nginx.crt ]; then \
		echo "$(YELLOW)📜 Generating self-signed SSL certificates...$(RESET)"; \
		chmod +x generate-ssl.sh; \
		./generate-ssl.sh; \
	else \
		echo "$(GREEN)✅ SSL certificates already exist$(RESET)"; \
	fi

build:
	@echo "$(BLUE)🐳 Building Docker containers...$(RESET)"
	docker compose build

up:
	@echo "$(BLUE)🚀 Starting services...$(RESET)"
	docker compose up -d
	@sleep 5
	@echo ""
	@echo "$(GREEN)✅ Services started!$(RESET)"
	@echo "$(BLUE)🌐 Application:$(RESET) https://localhost:8443"
	@echo ""
	@echo "--- $(YELLOW)MONITORING DASHBOARDS$(RESET) ---"
	@echo "$(GREEN)📈 Grafana:$(RESET)    http://localhost:3001"
	@echo "$(GREEN)🔥 Prometheus:$(RESET) http://localhost:9090"
	@echo "$(YELLOW)⚠️  Note: Accept the self-signed certificate warning in your browser$(RESET)"
	@echo "$(BLUE)📊 Backend API:$(RESET) https://localhost/api"
	@echo "$(BLUE)💬 Frontend:$(RESET)    https://localhost:8443"
	@echo ""

down:
	@echo "$(YELLOW)🛑 Stopping services...$(RESET)"
	docker compose down

clean:
	@echo "$(YELLOW)🧹 Cleaning containers and networks...$(RESET)"
	docker compose down --remove-orphans

fclean:
	@echo "$(YELLOW)🧼 Performing FULL cleanup (volumes & images)...$(RESET)"
	docker compose down -v --remove-orphans
	docker system prune -af --volumes
	@echo "$(YELLOW)🗑️  Removing SSL certificates...$(RESET)"
	rm -rf nginx/ssl
	@echo "$(YELLOW)🗑️  Removing media files...$(RESET)"
	rm -rf backend/media/*
	@echo "$(GREEN)✨ System is fresh!$(RESET)"

logs:
	@echo "$(BLUE)📋 Showing logs (Ctrl+C to exit)...$(RESET)"
	docker compose logs -f

restart:
	@echo "$(BLUE)♻️  Restarting services...$(RESET)"
	docker compose restart

status:
	@echo "$(BLUE)📊 Service status:$(RESET)"
	docker compose ps

users:
	@echo "$(BLUE)👥 Creating test users...$(RESET)"
	@NUM=$${NUM:-8}; \
	PASS=$${PASS:-testpass123}; \
	echo "   Number of users: $$NUM"; \
	echo "   Password: $$PASS"; \
	docker compose exec backend python create_test_users.py $$NUM $$PASS

re: fclean all

.PHONY: all setup ssl build up down clean fclean re logs restart status users