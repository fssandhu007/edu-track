# Deploying EduTrack to Google Cloud Platform (GCP)

This guide walks you through finding your database credentials, building your images, and deploying the EduTrack microservices to Google Kubernetes Engine (GKE).

## 1. Retrieve Database Credentials

You need the **Connection Name** and **Password** for your Cloud SQL instance.

### Step 1.1: Get the Connection Name (`DB_HOST`)
Run the following command in your terminal (or Cloud Shell):
```bash
gcloud sql instances list
```
*   Look for the column **CONNECTION NAME** (it usually looks like `project-id:region:instance-name`).
*   **Copy this string**. This is your `DB_HOST`.

### Step 1.2: Set/Verify the Password (`DB_PASSWORD`)
If you don't remember the password for the `postgres` user:
1.  Find your **Instance Name** from the list above (e.g., `edutrack-postgres`).
2.  Reset the password:
    ```bash
    gcloud sql users set-password postgres --instance=[INSTANCE_NAME] --password=[NEW_SECURE_PASSWORD]
    ```
*   **Copy this password**. This is your `DB_PASSWORD`.

### Step 1.3: Update Secrets
1.  Copy the example secrets file (if you haven't already):
    ```bash
    cp infra/secrets.yaml.example infra/secrets.yaml
    ```
2.  Open `infra/secrets.yaml` in your editor.
3.  Replace `YOUR_CLOUD_SQL_CONNECTION_NAME_OR_IP` with the **Connection Name** from Step 1.1.
4.  Replace `CHANGE_ME_TO_YOUR_PASSWORD` with the **Password** from Step 1.2.
5.  Save the file.

## 2. Setup Infrastructure

Ensure your GKE cluster and other resources exist.

### Step 2.1: Create GKE Cluster (if needed)
```bash
gcloud container clusters create edutrack-cluster --zone us-central1-a --num-nodes=2
```

### Step 2.2: Get Cluster Credentials
Connect `kubectl` to your cluster:
```bash
gcloud container clusters get-credentials edutrack-cluster --zone us-central1-a
```

### Step 2.3: Configure Docker
Allow Docker to push to your Google Container Registry:
```bash
gcloud auth configure-docker
```

## 3. Build and Push Images

We have provided a script to automate this.

*Note: You must be in the `edutrack` root directory.*

```bash
# Make the script executable (if needed)
chmod +x scripts/build_and_push.sh

# Run the build script
./scripts/build_and_push.sh
```
This will build `student-service`, `course-service`, and `enrollment-service` and push them to `gcr.io/sincere-tape-471709-e5/...`.

## 4. Deploy to Kubernetes

Now, apply the configurations to your live cluster.

```bash
# 1. Create the namespace
kubectl apply -f infra/namespace.yaml

# 2. Apply configuration and secrets
kubectl apply -f infra/configmap.yaml
kubectl apply -f infra/secrets.yaml

# 3. Deploy the microservices
kubectl apply -f infra/student-service.yaml
kubectl apply -f infra/course-service.yaml
kubectl apply -f infra/enrollment-service.yaml

# 4. Create the Ingress (External Access)
kubectl apply -f infra/ingress.yaml
```

## 5. Verification

### Check Status
```bash
kubectl get pods -n edutrack
```
Wait until all pods show `Running`.

### Get External IP
```bash
kubectl get ingress -n edutrack
```
Look for the `ADDRESS`. It might take a few minutes to appear. Once it does, you can access your services at `http://[ADDRESS]/api/students`, etc.
