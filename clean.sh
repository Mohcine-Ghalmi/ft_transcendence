#!/bin/bash
echo "🚀 Starting Docker Cleanup..."

# Remove all stopped containers
echo "🛑 Removing all stopped containers..."
docker rm -f $(docker ps -aq)

# Remove all unused networks
echo "🔗 Removing unused networks..."
docker network prune -f

# Remove all unused images
echo "🖼 Removing unused images..."
docker image prune -a -f

# Remove all unused volumes
echo "📂 Removing unused volumes..."
docker volume prune -f

# Remove build cache
echo "⚡ Removing Docker build cache..."
docker builder prune --all -f

# Remove all unused data
echo "🧹 Running full system cleanup..."
docker system prune -a --volumes -f

# Show Docker disk usage after cleanup
echo "📊 Docker disk usage after cleanup:"
docker system df

echo "✅ Docker cleanup complete!"
