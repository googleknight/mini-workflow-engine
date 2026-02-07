#!/bin/bash
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
