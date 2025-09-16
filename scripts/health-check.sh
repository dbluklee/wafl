#!/bin/bash

# Health check script for all services
# Usage: ./health-check.sh

set -e

echo "🏥 WAFL System Health Check"
echo "=========================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local service_url=$2
    local port=$3

    echo -n "Checking $service_name... "

    if curl -f -s --max-time 5 "$service_url/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    elif nc -z localhost $port 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Port open but health endpoint failed${NC}"
        return 1
    else
        echo -e "${RED}❌ Down${NC}"
        return 1
    fi
}

# Check infrastructure services
echo "Infrastructure Services:"
check_service "PostgreSQL" "localhost" 5432 || true
check_service "Redis" "localhost" 6379 || true
check_service "RabbitMQ" "localhost" 15672 || true

echo ""
echo "Backend Core Services:"
check_service "Auth Service" "http://localhost:3001" 3001 || true
check_service "Store Management" "http://localhost:3002" 3002 || true
check_service "Dashboard" "http://localhost:3003" 3003 || true
check_service "Order Service" "http://localhost:3004" 3004 || true
check_service "User Profile" "http://localhost:3009" 3009 || true
check_service "History" "http://localhost:3010" 3010 || true

echo ""
echo "Backend Support Services:"
check_service "API Gateway" "http://localhost:3000" 3000 || true
check_service "Payment" "http://localhost:3005" 3005 || true
check_service "AI Service" "http://localhost:3006" 3006 || true
check_service "Analytics" "http://localhost:3007" 3007 || true
check_service "Notification" "http://localhost:3008" 3008 || true
check_service "Scraping" "http://localhost:3011" 3011 || true
check_service "QR Service" "http://localhost:3012" 3012 || true
check_service "Inventory" "http://localhost:3013" 3013 || true
check_service "Delivery" "http://localhost:3014" 3014 || true
check_service "Hardware" "http://localhost:3015" 3015 || true

echo ""
echo "Frontend Services:"
check_service "POS Admin Web" "http://localhost:4000" 4000 || true
check_service "QR Order Web" "http://localhost:4001" 4001 || true
check_service "Kitchen Display" "http://localhost:4002" 4002 || true

echo ""
echo "Reverse Proxy:"
check_service "Nginx" "http://localhost:80" 80 || true

echo ""
echo "Health check completed!"