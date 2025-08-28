#!/bin/bash

# School Chat System Deployment Script
echo "🚀 Starting deployment process..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Set environment to production
export NODE_ENV=production

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️  Building frontend..."
npm run build
cd ..

# Copy frontend build to backend public folder (if serving from backend)
echo "📋 Setting up static files..."
mkdir -p backend/public
cp -r frontend/dist/* backend/public/ 2>/dev/null || echo "Skipping frontend copy"

# Run any database migrations (if needed)
echo "🗄️  Database setup..."
# cd backend && npm run migrate 2>/dev/null || echo "No migrations to run"

echo "✅ Deployment preparation completed!"
echo "🎯 Starting application..."

# Start the application
cd backend && npm start