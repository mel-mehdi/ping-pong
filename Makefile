all:
	cd frontend && python3 -m http.server 8000
kill:
	pkill -f "python3 -m http.server 8000"
.PHONY: all