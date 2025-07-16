Task Management Application

A comprehensive task management system with full user access control, calendar-based task management, and offline support. This application allows users to create, update, and delete tasks across multiple views (daily, weekly, monthly, yearly, and list). It also includes advanced features like resource management, image uploads, and filtering.

Key Features:

User Authentication and Roles:

Admin: Full access to add, delete, and update resources (facilities, machines, materials, and tools) for tasks.

Other Users: Create, update, and delete tasks with restricted access to resources.

Task Management:

Task Creation: Create tasks by clicking empty spaces in the calendar, selecting a date range, or using dedicated buttons.

Task Updates: Update tasks with details like start/end times, status, and images (for visual context).

Task Deletion: Delete tasks seamlessly from all views.

Calendar UI:

Multiple Views: Manage tasks in daily, weekly, monthly, yearly, and list views.

Drag-and-Drop: Easily reschedule tasks by dragging them across the calendar.

Resource Management:

Admins can manage resources (facilities, machines, materials, and tools) for each task.

Users can view assigned resources but cannot modify them.

Image Uploads:

Attach images to tasks for better visualization and context.

Images are stored and displayed within the task update field.

Offline Support:

Work seamlessly without an internet connection. Changes are synced when the app goes online.

Filtering:

Filter tasks by date, status, or resources for better organization and visibility.

Technologies Used:

Frontend: React, Redux, Event calender library, Tailwind css.

Backend: Node.js, Express, CouchDb .

Authentication: JWT (JSON Web Tokens) for secure user authentication.

Offline Support: Service Workers and PouchDb.

# installation guide

Prerequisites

Before starting, ensure you have the following installed on your system:

Docker: Install Docker

Docker Compose: Included with Docker Desktop or install it separately.

Git: Install Git

Node.js and npm (for local development without Docker): Install Node.js
   
   # Project Setup

1. Clone the Repository

Clone project repository from GitHub:

git clone https://github.com/Procon-system/system_managemnt_tool.git

2.Environment Variables

Backend

Navigate to the backend directory.

Create a .env file if it doesn't exist:

touch .env   # add .env code to this file

Frontend

Navigate to the frontend directory.

Create a .env file:

touch .env   # add .env code to this file

3.Build and Run the Project

Build the Docker images:
 
docker compose up --build

Start the services:

docker compose up

Access the application:

Frontend: http://localhost:3000

Backend: http://localhost:5000

4.Stopping the Services

To stop the services, use:

docker compose down

Troubleshooting

Port Conflicts:

Ensure ports 3000, 5000, and 27017 are not in use.

MongoDB Connection Issues:

Check the MONGO_URI in your .env file.

Rebuild Containers:

If changes aren’t reflected, rebuild the containers:

docker compose up --build

5.After any new changes to the code:

Run the following command to fetch the latest changes from the repository.

git pull 

Check for the .env file:

If the .env file is not present, create it and add the environment variables.

Rebuild Docker containers:

Run the following commands to ensure the changes are reflected in the Docker containers:

docker compose down

docker compose up --build

If no code changes have been made:

To simply restart the application, run:

docker compose up

# Full Guide: Setting Up WSL and Installing the Task Manager App online

## Step 1: Install WSL and Ubuntu

1. **Enable WSL** (Windows Subsystem for Linux) on Windows:
   - Open **PowerShell as Administrator** and run:
     ```powershell
     wsl --install -d Ubuntu
     ```
   - If WSL is already installed, update it with:
     ```powershell
     wsl --update
     ```

2. **Restart your system** and open Ubuntu from the Start Menu.

3. **Set up your Ubuntu user** (you’ll be prompted to create a username and password).

---

## Step 2: Update System Packages

Once inside WSL (Ubuntu), update package lists and upgrade:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 3: Install Docker and Docker Compose

Run the following commands to install **Docker** and **Docker Compose**:
```bash
sudo apt install -y docker.io docker-compose
```

Enable Docker service:
```bash
sudo systemctl enable --now docker
```

Add your user to the Docker group (to avoid using `sudo` every time):
```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify Docker is working:
```bash
docker --version
docker run hello-world
```

---

## Step 4: Clone Your Task Manager App Repository

clone it:
```bash
git clone https://github.com/Procon-system/system_managemnt_tool.git
cd task-manager-app
```

If your project is local, ensure the `docker-compose.yml` file is in the project directory.

---

## Step 5: Run the Installation Script

Now, run the **installation script** to automate everything:

1. **Create the script file**:
   ```bash
   nano install_online.sh
   ```

2. **Copy and paste the script below into the file**:
   ```bash
   #!/bin/bash
   
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
   ```

3. **Save and exit** (press `CTRL+X`, then `Y`, then `Enter`).

4. **Make the script executable**:
   ```bash
   chmod +x install_online.sh
   ```

5. **Run the script**:
   ```bash
   ./install_online.sh
   ```

---

## Step 6: Verify Everything is Running

To check if all containers are running:
```bash
docker ps
```

If you need to restart the app later:
```bash
docker-compose down
```
```bash
docker-compose up -d
```

To check application logs:
```bash
docker-compose logs -f
```

---

## Conclusion

🎉 Your Task Manager app should now be running in **WSL using Docker Compose**!


# Full Guide: Setting Up WSL and Installing the Task Manager App (Offline)

## Step 1: Install WSL and Ubuntu

1. **Enable WSL** on Windows:
   - Open **PowerShell as Administrator** and run:
     ```powershell
     wsl --install -d Ubuntu
     ```
   - If WSL is already installed, update it with:
     ```powershell
     wsl --update
     ```

2. **Restart your system** and open Ubuntu from the Start Menu.

3. **Set up your Ubuntu user** (you’ll be prompted to create a username and password).

---

## Step 2: Prepare Offline Installation Files

Since this is an **offline installation**, ensure you have the necessary files downloaded beforehand and transferred to your WSL environment:

1. **Required `.deb` packages** for Docker, Node.js, Redis, and CouchDB.
2. **Pre-downloaded Docker images** as `.tar` files.
3. **Node.js dependencies** as a `.tgz` package (if applicable).
4. **Your `docker-compose.yml` and project files**.

Create the following directories in WSL and place the files inside:
```bash
mkdir -p ~/offline-packages ~/docker-images
```
Transfer the files to these directories.

---

## Step 3: Run the Offline Installation Script

1. **Create the script file**:
   ```bash
   nano install_offline.sh
   ```

2. **Copy and paste the script below into the file**:
   ```bash
   #!/bin/bash
   
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
   ```

3. **Save and exit** (press `CTRL+X`, then `Y`, then `Enter`).

4. **Make the script executable**:
   ```bash
   chmod +x install_offline.sh
   ```

5. **Run the script**:
   ```bash
   ./install_offline.sh
   ```

---

## Step 4: Verify Everything is Running

To check if all containers are running:
```bash
docker ps
```

If you need to restart the app later:
```bash
docker-compose down
```
```bash
docker-compose up -d
```

To check application logs:
```bash
docker-compose logs -f
```

---

## Conclusion

🎉 Your Task Manager app should now be running **offline in WSL using Docker Compose**! 

# Service_managemnt_tool description
The service Management tool should be a platform were a Person is able to see move (move in Time by drag and drop) setup and distribute service Tasks from one or Multiple Machines. 
He should be able to distribute the Tasks to one ore Multiple Human or Technical resources such service Personal or needed Materials or Tools for the service etc. 

The Service Personal should be able to Receive (view it in the App) and access the Task description and fulfill the Task and Flag it to “done” or “not possible”. In case of done the Task will be 
moved to a History List and can be reviewed from the service Manager. In case of not possible it will stay in the Task list and can be new distributed or modified. Both Manager and Service personal 
should be able to add Notes and Pictures to the Task until it is moved to the History list.
The App should be able to receive Task Objects from a Machine. This Objects will be transferred using MQTT to the App.
The Object of the Machine Task has the same structure like the objects that will be setup in the Application and will be further handled as a new setup Tasks.
The Application should have a access Management were Manager and service personal need to  sign up (by admin) and sign in. This access management should have 5 login level (set able for the person by admin) 
this login level later will be used to view dedicated content in the App for example the Manager should have the right to edit new Tasks the Service Personal should be not able to do so etc.

The App should have a Warning Alarming structure and send mails ore SMS for information to the setup receiver.

The basis for this will be a Calendar structure because all Tasks are equal to Calendar events and will be handle like this.

App Structure

The app should be able to run under Linux OS using a X86 device as a Server component or run on a cloud server setup.
The App will be finally transferred into a Docker file for easy setup on new HW or Cloud devices.

Software Sources:
JavaScript, CSS, HTML, MQTT, nodes, xx as needed

Back end:
Nodes will be the host and interpreter for the Script codes

Front end:
The Graphical Interface will be displayed using a Browser on a Mobil or desktop Device in the same Network  

Development Framework is not specified and after discussion with Project leader free of Joyce.


The Calendar App from Github https://github.com/vkurko/calendar?tab=readme-ov-file

mind be helpful to save development time but it is not mandatory to use it. 
Styles and design can be free selected (nice ones please)

Features:

Receive Tasks from a Machine and show them on the Calendar Platform 
Setup manual additional Tasks by clicking on a free Time slot on the Calendar
by clicking on a free Time slot open the editor form for a Task
Tasks must be movable in the Calendar Timeline by Drag and drop
open the Task by clicking on the Task for review or modification
Show a preview of the Task on the Calendar Object
Set able time before the Task time color of the task switch to Yellow
If Task time is reached Task color switch to Red
if Alarm/warning is setup the App send a SMS or mail
Task can be flagged by pushing a button to done or not done
Task can be assigned to one or more service personal
History list for done Tasks
use management with 5 access level
Editable Technical resources list Tool, costs
Editable Human resources list Person, work hours, costs 
Block of resources or notice of double use 

Development Steps

1. Create a workable node environment
- Download and install the Calendar Application
- create a docker file of this setup for testing and easy transfer of the progress
- Setup a Task object and GUI Form for creating new task
- setup persistent Database to store the Tasks
- setup login Page and user Management
- setup Persistent user Database
- create Tool Database 
- create Material Database
- create color handling of the Task green/yellow/red
----------Tools, Task, Material, user, can be Handled in one Database but different Array------

- send run able docker file --

2. setup MQTT communication and exchange of Task Object
- setup distribution of the Task to the dedicated Personal
- setup Historical view can be generated from the main Database
- use Access level 5 for admin purpose (access to all features)
- Access level 1 for just view, 2 for service People, 3 for Manager

- send run able docker file --



3. create the form for setup human resources
- create Form for setup Tools
- create Form for setup Materials
- create Picture handling and saving to the Task

- send run able docker file --

4. Create Alarming
- create Form for mail editing
- create Form for SMS editing
