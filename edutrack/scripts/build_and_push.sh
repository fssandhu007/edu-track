#!/bin/bash

# Configuration
PROJECT_ID="sincere-tape-471709-e5"
SERVICES=("student-service" "course-service" "enrollment-service")

# Function to build and push
build_and_push() {
    local service=$1
    echo "--------------------------------------------------"
    echo "Processing $service..."
    echo "--------------------------------------------------"
    
    echo "Building image..."
    docker build -t gcr.io/$PROJECT_ID/$service:latest ./$service
    
    echo "Pushing image to GCR..."
    docker push gcr.io/$PROJECT_ID/$service:latest
    
    echo "$service done."
}

# Main loop
echo "Starting build and push process for project: $PROJECT_ID"
for service in "${SERVICES[@]}"; do
    build_and_push $service
done

echo "--------------------------------------------------"
echo "All services built and pushed successfully!"
