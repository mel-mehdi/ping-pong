all:
	@echo "Starting backend server..."
	@cd backend && npm install && npm start & 
	@sleep 2
	@echo "Starting frontend server..."
	@cd frontend && python3 -m http.server 8000

backend:
	cd backend && npm install && npm start

frontend:
	cd frontend && python3 -m http.server 8000

kill:
	pkill -f "python3 -m http.server 8000"
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