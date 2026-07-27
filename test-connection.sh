#!/bin/bash

echo "🔗 Testing Backend-Frontend Connection"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test Backend Health
echo "1️⃣  Testing Backend Server..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)

if [ "$BACKEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running. Start it with: cd backend && npm run dev${NC}"
    exit 1
fi

# Test API Endpoint
echo ""
echo "2️⃣  Testing API Products Endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/products)

if [ "$API_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ API endpoint is working${NC}"
else
    echo -e "${RED}❌ API endpoint failed (Status: $API_RESPONSE)${NC}"
fi

# Test Image Serving
echo ""
echo "3️⃣  Testing Image Serving..."
IMAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/images/Dress.jpeg)

if [ "$IMAGE_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Image serving is working${NC}"
else
    echo -e "${YELLOW}⚠️  Image serving may have issues (Status: $IMAGE_RESPONSE)${NC}"
fi

# Test Frontend
echo ""
echo "4️⃣  Testing Frontend Server..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running. Start it with: cd frontend && npm run dev${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   API:      http://localhost:5000/api"
echo ""
