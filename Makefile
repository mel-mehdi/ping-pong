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

.PHONY: all backend frontend kill