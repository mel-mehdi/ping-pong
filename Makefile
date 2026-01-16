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
	@echo "🔴 Frontend: https://localhost/"
	@echo "📊 Backend API: https://localhost/api/"
	@echo "📈 Prometheus: http://localhost:9090"
	@echo "📊 Grafana: http://localhost:3001 (check .env for credentials)"
	@echo "🔍 Status Page: https://localhost/status/"
	@echo ""
	@echo "⚠️  Note: Accept the self-signed certificate warning in your browser"

down:
	@echo "🛑 Stopping services..."
	docker compose down

clean:
	@echo "🧹 Cleaning containers and volumes..."
	docker compose down -v
	@echo "🗑️  Removing Python cache..."
	@find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type f -name "*.pyc" -delete 2>/dev/null || true

fclean: clean
	@echo "🧼 Performing full cleanup..."
	docker compose down -v --remove-orphans
	docker system prune -af --volumes
	docker builder prune -af
	@echo "🗑️  Removing SSL certificates..."
	@rm -rf nginx/ssl/*.crt nginx/ssl/*.key 2>/dev/null || true
	@echo "🗑️  Removing Docker auto-created folders (requires sudo)..."
	@sudo rm -rf backend/ssl 2>/dev/null || true
	@sudo rm -rf backend/staticfiles 2>/dev/null || true
	@sudo rm -rf frontend/node_modules 2>/dev/null || true
	@sudo rm -rf backups 2>/dev/null || true
	@echo "🗑️  Removing migration files..."
	@find backend/*/migrations -name "[0-9]*.py" -type f -delete 2>/dev/null || true
	@echo "🗑️  Removing Python cache..."
	@find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "🗑️  Removing media files..."
	@rm -rf backend/media/* 2>/dev/null || true
	@echo "🗑️  Removing test reports..."
	@rm -f test_report_*.txt 2>/dev/null || true
	@echo "✅ Full cleanup complete!"

re: fclean all

logs:
	@echo "📋 Showing logs (Ctrl+C to exit)..."
	docker compose logs -f

logs-backend:
	@echo "📋 Showing backend logs..."
	docker compose logs -f backend

logs-frontend:
	@echo "📋 Showing frontend logs..."
	docker compose logs -f frontend

logs-nginx:
	@echo "📋 Showing nginx logs..."
	docker compose logs -f nginx

restart:
	@echo "♻️  Restarting services..."
	docker compose restart

restart-backend:
	@echo "♻️  Restarting backend..."
	docker compose restart backend

restart-frontend:
	@echo "♻️  Restarting frontend..."
	docker compose restart frontend

status:
	@echo "📊 Service status:"
	@docker compose ps
	@echo ""
	@echo "💾 Docker volumes:"
	@docker volume ls | grep ft_trans || echo "No volumes found"

health:
	@echo "🏥 Running health checks..."
	@./devops/scripts/health-check.sh

users:
	@echo "👥 Creating test users..."
	@NUM=$${NUM:-4}; \
	PASS=$${PASS:-testpass123}; \
	echo "   Number of users: $$NUM"; \
	echo "   Password: $$PASS"; \
	docker compose exec backend python create_test_users.py $$NUM $$PASS

shell-backend:
	@echo "🐚 Opening backend shell..."
	docker compose exec backend /bin/sh

shell-db:
	@echo "🐚 Opening database shell..."
	docker compose exec database psql -U postgres transcendence

backup:
	@echo "💾 Creating manual backup..."
	docker compose exec backup sh /backup.sh

migrations:
	@echo "🔄 Making migrations..."
	docker compose exec backend python manage.py makemigrations

migrate:
	@echo "🔄 Applying migrations..."
	docker compose exec backend python manage.py migrate

.PHONY: all ssl build up down clean fclean re logs logs-backend logs-frontend logs-nginx \
        restart restart-backend restart-frontend status health users shell-backend shell-db \
        backup migrations migrate
