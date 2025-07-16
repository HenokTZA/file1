#!/bin/bash
# to make the script executable run chmod +x install_online.sh   
# to run the script ./install_online.sh  and for other steps please check the readme file

# Function to check command success
check_success() {
  if [ $? -ne 0 ]; then
    echo "Error: $1 failed. Exiting."
    exit 1
  fi
}

echo "Starting online installation..."

# Step 1: Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y
check_success "System update"

# Step 2: Install Docker & Docker Compose
echo "Installing Docker and Docker Compose..."
sudo apt install -y docker.io docker-compose
check_success "Docker installation"

# Step 3: Start and enable Docker service
echo "Starting and enabling Docker service..."
sudo systemctl enable --now docker
check_success "Starting Docker service"

# Step 4: Run Docker Compose
echo "Starting application with Docker Compose..."
docker-compose up -d
check_success "Starting Docker Compose services"

# Verify installation
echo "Verifying running containers..."
docker ps

echo "Online installation completed successfully!"