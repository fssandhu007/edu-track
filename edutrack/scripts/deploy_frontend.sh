#!/bin/bash

PROJECT_ID="sincere-tape-471709-e5"
IMAGE_NAME="gcr.io/$PROJECT_ID/edutrack-frontend:latest"

echo "--------------------------------------------------"
echo "Deploying Frontend to GKE"
echo "--------------------------------------------------"

# 1. Build Docker Image
echo "Building Frontend Docker Image..."
# We are currently in 'edutrack/scripts', we need to go to root
cd "$(dirname "$0")/../.." || exit

docker build -t $IMAGE_NAME .

# 2. Push to GCR
echo "Pushing to GCR..."
docker push $IMAGE_NAME

# 3. Apply Kubernetes Manifest
echo "Applying Kubernetes Manifest..."
# Go back to edutrack folder for kubectl
cd h:/DARPA2/edu-track/edutrack || exit 

# Note: The infra file is likely in edutrack/infra
kubectl apply -f infra/frontend.yaml

echo "--------------------------------------------------"
echo "Frontend Deployed!"
echo "Wait for External IP: kubectl get svc frontend -n edutrack"
echo "--------------------------------------------------"
