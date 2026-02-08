#!/bin/bash

# Function to handle initialization
init() {
  echo "🚀 Initializing development environment..."
  
  # Copy .env files if they don't exist
  if [ -f "backend/.env.example" ]; then
    if [ ! -f "backend/.env" ]; then
      echo "📝 Creating backend/.env from .env.example..."
      cp backend/.env.example backend/.env
    else
      echo "ℹ️  backend/.env already exists, skipping copy."
    fi
  fi

  if [ -f "frontend/.env.example" ]; then
    if [ ! -f "frontend/.env" ]; then
      echo "📝 Creating frontend/.env from .env.example..."
      cp frontend/.env.example frontend/.env
    else
      echo "ℹ️  frontend/.env already exists, skipping copy."
    fi
  fi

  # Install dependencies
  echo "📦 Installing backend dependencies..."
  (cd backend && npm install)

  echo "📦 Installing frontend dependencies..."
  (cd frontend && npm install)

  echo "✅ Initialization complete!"
}

# Check for --init flag
if [[ "$1" == "--init" ]]; then
  init
  exit 0
fi

echo "Starting local development..."

if ! docker info > /dev/null 2>&1; then
  echo "Warning: Docker is not running. Database will not be available."
else
  docker-compose up -d
  echo "Waiting for database to be ready..."
  sleep 5
  (cd backend && npx prisma generate && npx prisma migrate deploy)
fi

(cd backend && npm run dev) &
(cd frontend && npm run dev) &
wait

