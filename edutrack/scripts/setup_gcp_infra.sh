#!/bin/bash

# Configuration
INSTANCE_NAME="edutrack-postgres"
REGION="us-central1"
ZONE="us-central1-a"
DB_PASSWORD="secure-password-changeme" # You can change this or pass it as an arg

echo "--------------------------------------------------"
echo "Setting up EduTrack Infrastructure on GCP"
echo "--------------------------------------------------"

# 1. Enable APIs
echo "Enabling necessary APIs..."
gcloud services enable container.googleapis.com sqladmin.googleapis.com

# 2. Create Cloud SQL Instance
echo "Creating Cloud SQL Instance '$INSTANCE_NAME' (this may take 10-15 minutes)..."
# Check if exists first (simple check)
if gcloud sql instances describe $INSTANCE_NAME > /dev/null 2>&1; then
    echo "Instance '$INSTANCE_NAME' already exists."
else
    gcloud sql instances create $INSTANCE_NAME \
        --database-version=POSTGRES_15 \
        --cpu=1 \
        --memory=3840Mi \
        --region=$REGION \
        --root-password=$DB_PASSWORD
fi

# 3. Create Databases
echo "Creating databases..."
for db in edutrack_students edutrack_courses edutrack_enrollments; do
    echo "Creating database: $db"
    gcloud sql databases create $db --instance=$INSTANCE_NAME || echo "Database $db might already exist."
done

# 4. Create GKE Cluster
echo "Creating GKE Cluster 'edutrack-cluster' (this may take 5-10 minutes)..."
if gcloud container clusters describe edutrack-cluster --zone $ZONE > /dev/null 2>&1; then
    echo "Cluster 'edutrack-cluster' already exists."
else
    gcloud container clusters create edutrack-cluster \
        --zone $ZONE \
        --num-nodes=2 \
        --machine-type=e2-medium
fi

echo "--------------------------------------------------"
echo "Infrastructure Setup Complete!"
echo "--------------------------------------------------"
echo "Cloud SQL Connection Name:"
gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)"
echo ""
echo "Database Password: $DB_PASSWORD"
echo "--------------------------------------------------"
