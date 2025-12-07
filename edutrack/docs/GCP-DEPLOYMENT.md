# GCP Deployment Guide for EduTrack Microservices

This guide provides step-by-step instructions for deploying EduTrack microservices to Google Cloud Platform (GCP) using Google Kubernetes Engine (GKE) and Cloud SQL.

## Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **kubectl** installed
4. **Docker** installed

## Step 1: Initial GCP Setup

### 1.1 Set Project Variables
\`\`\`bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export ZONE="us-central1-a"

# Configure gcloud
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE
\`\`\`

### 1.2 Enable Required APIs
\`\`\`bash
gcloud services enable \
  container.googleapis.com \
  sqladmin.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
\`\`\`

## Step 2: Create Cloud SQL Instances

### 2.1 Create PostgreSQL Instance
\`\`\`bash
# Create Cloud SQL instance
gcloud sql instances create edutrack-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=YOUR_SECURE_ROOT_PASSWORD \
  --availability-type=zonal \
  --storage-size=10GB \
  --storage-type=SSD

# Note the connection name
gcloud sql instances describe edutrack-db --format='value(connectionName)'
\`\`\`

### 2.2 Create Databases
\`\`\`bash
# Create databases for each service
gcloud sql databases create edutrack_students --instance=edutrack-db
gcloud sql databases create edutrack_courses --instance=edutrack-db
gcloud sql databases create edutrack_enrollments --instance=edutrack-db
\`\`\`

### 2.3 Create Database User
\`\`\`bash
# Create a user for the services
gcloud sql users create edutrack_user \
  --instance=edutrack-db \
  --password=YOUR_SECURE_USER_PASSWORD
\`\`\`

### 2.4 Initialize Database Schemas

Connect to Cloud SQL and run initialization scripts:

\`\`\`bash
# Connect using Cloud SQL Auth Proxy (recommended for local access)
# Download the proxy first: https://cloud.google.com/sql/docs/postgres/sql-proxy

# Terminal 1 - Start proxy
./cloud-sql-proxy $PROJECT_ID:$REGION:edutrack-db

# Terminal 2 - Connect and run SQL
psql -h 127.0.0.1 -U edutrack_user -d edutrack_students < student-service/db/init.sql
psql -h 127.0.0.1 -U edutrack_user -d edutrack_courses < course-service/db/init.sql
psql -h 127.0.0.1 -U edutrack_user -d edutrack_enrollments < enrollment-service/db/init.sql
\`\`\`

## Step 3: Create GKE Cluster

### 3.1 Create Cluster
\`\`\`bash
gcloud container clusters create edutrack-cluster \
  --zone=$ZONE \
  --num-nodes=3 \
  --machine-type=e2-small \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --workload-pool=$PROJECT_ID.svc.id.goog
\`\`\`

### 3.2 Get Cluster Credentials
\`\`\`bash
gcloud container clusters get-credentials edutrack-cluster --zone=$ZONE
\`\`\`

### 3.3 Verify Connection
\`\`\`bash
kubectl get nodes
\`\`\`

## Step 4: Build and Push Docker Images

### 4.1 Configure Docker for GCR
\`\`\`bash
gcloud auth configure-docker
\`\`\`

### 4.2 Build and Push Images
\`\`\`bash
cd edutrack

# Build and push Student Service
docker build -t gcr.io/$PROJECT_ID/student-service:v1.0.0 ./student-service
docker push gcr.io/$PROJECT_ID/student-service:v1.0.0

# Build and push Course Service
docker build -t gcr.io/$PROJECT_ID/course-service:v1.0.0 ./course-service
docker push gcr.io/$PROJECT_ID/course-service:v1.0.0

# Build and push Enrollment Service
docker build -t gcr.io/$PROJECT_ID/enrollment-service:v1.0.0 ./enrollment-service
docker push gcr.io/$PROJECT_ID/enrollment-service:v1.0.0
\`\`\`

### 4.3 Alternative: Use Cloud Build
\`\`\`bash
# Build all services with Cloud Build
gcloud builds submit --config cloudbuild.yaml
\`\`\`

Create `cloudbuild.yaml`:
\`\`\`yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/student-service:$COMMIT_SHA', './student-service']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/course-service:$COMMIT_SHA', './course-service']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/enrollment-service:$COMMIT_SHA', './enrollment-service']
images:
  - 'gcr.io/$PROJECT_ID/student-service:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/course-service:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/enrollment-service:$COMMIT_SHA'
\`\`\`

## Step 5: Configure Kubernetes Secrets

### 5.1 Create Namespace
\`\`\`bash
kubectl apply -f infra/namespace.yaml
\`\`\`

### 5.2 Create Secrets
\`\`\`bash
# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe edutrack-db --format='value(connectionName)')

# Create secrets (replace with your actual values)
kubectl create secret generic db-credentials \
  --namespace=edutrack \
  --from-literal=DB_HOST=/cloudsql/$CONNECTION_NAME \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=edutrack_user \
  --from-literal=DB_PASSWORD=YOUR_SECURE_USER_PASSWORD

kubectl create secret generic student-db-credentials \
  --namespace=edutrack \
  --from-literal=DB_NAME=edutrack_students

kubectl create secret generic course-db-credentials \
  --namespace=edutrack \
  --from-literal=DB_NAME=edutrack_courses

kubectl create secret generic enrollment-db-credentials \
  --namespace=edutrack \
  --from-literal=DB_NAME=edutrack_enrollments
\`\`\`

### 5.3 Create ConfigMap
\`\`\`bash
kubectl apply -f infra/configmap.yaml
\`\`\`

## Step 6: Set Up Cloud SQL Proxy (Workload Identity)

### 6.1 Create Service Account
\`\`\`bash
# Create GCP service account
gcloud iam service-accounts create edutrack-sql-proxy \
  --display-name="EduTrack Cloud SQL Proxy"

# Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:edutrack-sql-proxy@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Create Kubernetes service account
kubectl create serviceaccount edutrack-ksa --namespace=edutrack

# Bind KSA to GSA
gcloud iam service-accounts add-iam-policy-binding \
  edutrack-sql-proxy@$PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:$PROJECT_ID.svc.id.goog[edutrack/edutrack-ksa]"

# Annotate the KSA
kubectl annotate serviceaccount edutrack-ksa \
  --namespace=edutrack \
  iam.gke.io/gcp-service-account=edutrack-sql-proxy@$PROJECT_ID.iam.gserviceaccount.com
\`\`\`

### 6.2 Update Deployments for Cloud SQL Proxy

Add Cloud SQL Proxy sidecar to each deployment. Update each service YAML:

\`\`\`yaml
# Add to spec.template.spec
serviceAccountName: edutrack-ksa
containers:
  # ... existing container ...
  - name: cloud-sql-proxy
    image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.8.0
    args:
      - "--structured-logs"
      - "--auto-iam-authn"
      - "PROJECT_ID:REGION:edutrack-db"
    securityContext:
      runAsNonRoot: true
    resources:
      requests:
        memory: "64Mi"
        cpu: "50m"
\`\`\`

## Step 7: Deploy Services

### 7.1 Update Image Tags
Update the image tags in the Kubernetes manifests to use your project ID:
\`\`\`bash
# Replace PROJECT_ID in all YAML files
sed -i "s/PROJECT_ID/$PROJECT_ID/g" infra/*.yaml
\`\`\`

### 7.2 Deploy All Resources
\`\`\`bash
kubectl apply -f infra/configmap.yaml
kubectl apply -f infra/student-service.yaml
kubectl apply -f infra/course-service.yaml
kubectl apply -f infra/enrollment-service.yaml
kubectl apply -f infra/hpa.yaml
\`\`\`

### 7.3 Verify Deployments
\`\`\`bash
kubectl get pods -n edutrack
kubectl get services -n edutrack
kubectl get deployments -n edutrack
\`\`\`

## Step 8: Configure Ingress

### 8.1 Reserve Static IP
\`\`\`bash
gcloud compute addresses create edutrack-ip --global
gcloud compute addresses describe edutrack-ip --global
\`\`\`

### 8.2 Deploy Ingress
\`\`\`bash
kubectl apply -f infra/ingress.yaml
\`\`\`

### 8.3 Get External IP
\`\`\`bash
kubectl get ingress -n edutrack
\`\`\`

## Step 9: Set Up Domain and SSL (Optional)

### 9.1 Configure DNS
Point your domain to the external IP from the Ingress.

### 9.2 Add SSL with Managed Certificate
\`\`\`yaml
# managed-certificate.yaml
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: edutrack-cert
  namespace: edutrack
spec:
  domains:
    - api.yourdomain.com
\`\`\`

Update Ingress annotations:
\`\`\`yaml
annotations:
  networking.gke.io/managed-certificates: edutrack-cert
  kubernetes.io/ingress.class: "gce"
\`\`\`

## Step 10: Monitoring and Logging

### 10.1 Enable Cloud Monitoring
\`\`\`bash
# Monitoring is enabled by default on GKE
# Access via GCP Console > Monitoring
\`\`\`

### 10.2 View Logs
\`\`\`bash
# View logs for a specific service
kubectl logs -l app=student-service -n edutrack --tail=100

# Or use Cloud Logging in GCP Console
\`\`\`

### 10.3 Set Up Alerts (Optional)
Create alerting policies in Cloud Monitoring for:
- Pod restart counts
- Memory/CPU utilization
- Error rates
- Response latencies

## Step 11: Testing Production Deployment

### 11.1 Test Health Endpoints
\`\`\`bash
EXTERNAL_IP=$(kubectl get ingress edutrack-ingress -n edutrack -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

curl http://$EXTERNAL_IP/api/students/../health
curl http://$EXTERNAL_IP/api/courses/../health
curl http://$EXTERNAL_IP/api/enrollments/../health
\`\`\`

### 11.2 Test CRUD Operations
\`\`\`bash
# Create a student
curl -X POST http://$EXTERNAL_IP/api/students \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "full_name": "Test User"}'
\`\`\`

## Cleanup

To remove all resources:

\`\`\`bash
# Delete GKE cluster
gcloud container clusters delete edutrack-cluster --zone=$ZONE

# Delete Cloud SQL instance
gcloud sql instances delete edutrack-db

# Delete static IP
gcloud compute addresses delete edutrack-ip --global

# Delete container images
gcloud container images delete gcr.io/$PROJECT_ID/student-service:v1.0.0
gcloud container images delete gcr.io/$PROJECT_ID/course-service:v1.0.0
gcloud container images delete gcr.io/$PROJECT_ID/enrollment-service:v1.0.0
\`\`\`

## Cost Optimization Tips

1. **Use Preemptible VMs** for non-production workloads
2. **Right-size** your GKE nodes based on actual usage
3. **Use committed use discounts** for predictable workloads
4. **Enable cluster autoscaling** to scale down during low usage
5. **Use Cloud SQL automatic storage increase** instead of over-provisioning

## Troubleshooting

### Pods not starting
\`\`\`bash
kubectl describe pod <pod-name> -n edutrack
kubectl logs <pod-name> -n edutrack
\`\`\`

### Database connection issues
\`\`\`bash
# Check Cloud SQL Proxy logs
kubectl logs <pod-name> -n edutrack -c cloud-sql-proxy

# Verify IAM permissions
gcloud projects get-iam-policy $PROJECT_ID
\`\`\`

### Ingress not working
\`\`\`bash
kubectl describe ingress edutrack-ingress -n edutrack
\`\`\`

## Security Recommendations

1. Enable **VPC-native cluster** for better network isolation
2. Use **Private GKE cluster** for production
3. Enable **Binary Authorization** for container image validation
4. Implement **Network Policies** to restrict pod-to-pod communication
5. Use **GKE Workload Identity** instead of service account keys
6. Enable **Cloud Armor** for DDoS protection
7. Regularly update GKE cluster and node versions
