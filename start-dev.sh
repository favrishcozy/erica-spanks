#!/bin/bash

echo "🚀 Starting Erica Spanks Development Servers"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if pgrep -x mongod > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB is not running. Attempting to start...${NC}"
    sudo systemctl start mongod 2>/dev/null || echo -e "${RED}❌ Could not start MongoDB. Please start it manually.${NC}"
fi

echo ""
echo "📦 Checking dependencies..."

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env not found. Creating default...${NC}"
    cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erica-spanks
JWT_SECRET=erica-spanks-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
EOF
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env not found. Creating default...${NC}"
    echo "VITE_API_URL=http://localhost:5000" > frontend/.env
fi

echo ""
echo "🎬 Starting servers..."
echo ""
echo "This will open two terminal tabs:"
echo "  1. Backend  → http://localhost:5000"
echo "  2. Frontend → http://localhost:5173"
echo ""

# Function to open terminal based on the system
open_terminal() {
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="Backend Server" -- bash -c "cd backend && npm run dev; exec bash"
        sleep 2
        gnome-terminal --tab --title="Frontend Server" -- bash -c "cd frontend && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -T "Backend Server" -e "cd backend && npm run dev; bash" &
        sleep 2
        xterm -T "Frontend Server" -e "cd frontend && npm run dev; bash" &
    else
        echo -e "${YELLOW}Could not detect terminal emulator.${NC}"
        echo "Please run these commands manually in separate terminals:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd backend && npm run dev"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd frontend && npm run dev"
    fi
}

open_terminal

echo ""
echo -e "${GREEN}✅ Servers starting!${NC}"
echo ""
echo "Wait a few seconds, then access:"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🔧 Backend:  http://localhost:5000"
echo "  🏥 Health:   http://localhost:5000/health"
echo ""
echo "To stop servers: Press Ctrl+C in each terminal window"
echo ""
