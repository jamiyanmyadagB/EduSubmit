#!/bin/bash

echo "🚀 Starting EduSubmit Development Environment..."
echo

echo "📦 Installing dependencies..."
npm run install:all
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo
echo "🔥 Starting both frontend and backend..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo "📍 Backend APIs will be available at: http://localhost:8080"
echo
echo "Press Ctrl+C to stop all services"
echo

npm run dev
