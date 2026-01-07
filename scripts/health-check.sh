#!/bin/bash

echo "Checking system health..."

services=(
    "http://localhost:8000/"            # frontend
    "http://localhost:8001/"            # backend
    "http://localhost:9090/-/healthy"   # prometheus
    "http://localhost:3001/api/health"  # grafana
)

all_good=true

for service in "${services[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $service)
    if [ $response -eq 200 ]; then
        echo "✓ $service is up"
    else
        echo "✗ $service is down (got HTTP $response)"
        all_good=false
    fi
done

if [ "$all_good" = true ]; then
    echo "All systems running"
    exit 0
else
    echo "Some systems are down!"
    exit 1
fi
