#!/bin/bash

echo "🚀 Erica Spanks E-commerce Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env files exist
echo "📝 Checking environment configuration..."
echo ""

# Backend .env
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from .env.example..."
    cp backend/.env.example backend/.env
    print_success "Created backend/.env - Please update with your credentials"
    echo ""
    echo "🔑 Required backend environment variables:"
    echo "   - MONGODB_URI (MongoDB connection string)"
    echo "   - JWT_SECRET (random secret key for JWT)"
    echo "   - CLOUDINARY_* (optional, for cloud image hosting)"
    echo ""
else
    print_success "Backend .env exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    print_warning "Frontend .env file not found. Creating..."
    echo "VITE_API_URL=http://localhost:5000" > frontend/.env
    print_success "Created frontend/.env with default API URL"
else
    print_success "Frontend .env exists"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "📥 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📥 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "🗄️  Database Setup"
echo ""

# Check if MongoDB is running
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    print_success "MongoDB CLI found"
    
    read -p "Do you want to seed the database with sample products? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        cd backend
        node seed.js
        if [ $? -eq 0 ]; then
            print_success "Database seeded successfully"
        else
            print_error "Failed to seed database"
        fi
        cd ..
    fi
else
    print_warning "MongoDB CLI not found. Please ensure MongoDB is installed and running."
    echo "   Install MongoDB: https://www.mongodb.com/docs/manual/installation/"
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update environment variables:"
echo "   - Backend: backend/.env"
echo "   - Frontend: frontend/.env"
echo ""
echo "2. Make sure MongoDB is running:"
echo "   - Start MongoDB: sudo systemctl start mongod"
echo "   - Check status: sudo systemctl status mongod"
echo ""
echo "3. Start the development servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5000"
echo "   - Health Check: http://localhost:5000/health"
echo ""
echo "🎉 Happy coding!"
