#!/bin/bash
echo "🚀 Starting Docker Cleanup..."

echo "🛑 Removing all stopped containers..."
docker rm -f $(docker ps -aq)

echo "🔗 Removing unused networks..."
docker network prune -f

echo "🖼 Removing unused images..."
docker image prune -a -f

echo "📂 Removing unused volumes..."
docker volume prune -f

echo "⚡ Removing Docker build cache..."
docker builder prune --all -f

echo "🧹 Running full system cleanup..."
docker system prune -a --volumes -f

echo "📊 Docker disk usage after cleanup:"
docker system df

echo "✅ Docker cleanup complete!"
