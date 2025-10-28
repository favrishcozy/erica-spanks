#!/bin/bash

echo "🚀 Erica Spanks Development Setup"
echo "=================================="

# Create .env file for backend if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - please update with your actual values"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start development:"
echo "1. Frontend: cd frontend && npm run dev"
echo "2. Backend:  cd backend && npm run dev"
echo ""
echo "URLs:"
echo "• Frontend: http://localhost:5173"
echo "• Backend:  http://localhost:5000"
echo ""
echo "📚 Pages available:"
echo "• Homepage with hero banner and 'Comfort that turns heads' tagline"
echo "• Shop/Collections with filtering (Dresses, Loungewear, Two-piece Sets, New In, Essentials)"
echo "• Product Detail with multiple images, size guide, materials & care"
echo "• About page with brand story and mission"
echo "• Contact page with form, social links, and WhatsApp integration"
echo "• Lookbook page for styled photos and campaigns"
echo ""
echo "✨ All features implemented according to your requirements!"
