all:
	@echo "Starting backend server..."
	@cd backend && npm install && npm start & 
	@sleep 2
	@echo "Starting Vite dev server (TypeScript)..."
	@cd frontend && npm install && npm run dev

backend:
	cd backend && npm install && npm start

frontend:
	cd frontend && npm install && npm run dev

kill:
	pkill -f "vite"
	pkill -f "node.*server.js"

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart:
	docker compose restart

docker-clean:
	docker compose down -v
	docker system prune -f

docker-rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

.PHONY: all backend frontend kill docker-build docker-up docker-down docker-logs docker-restart docker-clean docker-rebuild