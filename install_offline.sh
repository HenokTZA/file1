#!/bin/bash
# to make the script executable run chmod +x install_offline.sh   
# to run the script ./install_offline.sh  and for other steps please check the readme file
# Define directories
PACKAGE_DIR="$(pwd)/offline-packages"
DOCKER_IMAGES_DIR="$(pwd)/docker-images"

# Function to check command success
check_success() {
  if [ $? -ne 0 ]; then
    echo "Error: $1 failed. Exiting."
    exit 1
  fi
}

echo "Starting offline installation..."

# Step 1: Install .deb packages
echo "Installing required packages..."
sudo dpkg -i $PACKAGE_DIR/*.deb
check_success "Installing .deb packages"

# Fix any broken dependencies
echo "Fixing broken dependencies..."
sudo apt --fix-broken install -y
check_success "Fixing dependencies"

# Step 2: Load Docker images
echo "Loading Docker images..."
for image in $DOCKER_IMAGES_DIR/*.tar; do
  docker load -i "$image"
  check_success "Loading Docker image $image"
done

# Step 3: Start services using Docker Compose
echo "Starting application with Docker Compose..."
docker-compose up -d
check_success "Starting Docker Compose services"

# Verify installation
echo "Verifying installation..."
docker ps
node -v
npm -v
redis-server --version
couchdb -V

echo "Offline installation completed successfully!"