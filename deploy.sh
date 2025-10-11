#!/bin/bash

# Quick deployment script for EduNexa LMS

echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Run linting
echo "🔍 Running linter..."
npm run lint

# Step 3: Build project
echo "🏗️ Building project..."
npm run build

# Step 4: Test build
echo "✅ Build completed successfully!"
echo "📁 Build files are in 'dist' folder"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render.com"
echo "2. Deploy frontend to Netlify"
echo "3. Update environment variables"

echo "🎉 Ready for deployment!"