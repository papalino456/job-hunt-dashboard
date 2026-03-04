#!/bin/bash

echo "🚀 Setting up Job Hunt Dashboard..."

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f .env ]; then
  echo "🔐 Creating backend .env file..."
  cp .env.example .env
  echo "⚠️  Please edit backend/.env and set your PASSWORD"
fi

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ ! -f .env.local ]; then
  echo "🔐 Creating frontend .env.local file..."
  cp .env.example .env.local
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and set a secure PASSWORD"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000"
