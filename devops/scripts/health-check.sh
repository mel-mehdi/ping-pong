#!/bin/bash

echo "Checking system health..."

services=(
    "https://localhost/"                # frontend (via nginx)
    "https://localhost/api/"            # backend (via nginx)
    "http://localhost:9090/-/healthy"   # prometheus
    "http://localhost:3001/api/health"  # grafana
)

all_good=true

for service in "${services[@]}"; do
    response=$(curl -sk -o /dev/null -w "%{http_code}" "$service")
    if [ "$response" -eq 200 ]; then
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
