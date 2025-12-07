#!/bin/bash
# Build all Docker images locally

set -e

echo "Building Student Service..."
docker build -t student-service:latest ./student-service

echo "Building Course Service..."
docker build -t course-service:latest ./course-service

echo "Building Enrollment Service..."
docker build -t enrollment-service:latest ./enrollment-service

echo "All services built successfully!"
echo ""
echo "To run locally with Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "To push to GCR (replace PROJECT_ID):"
echo "  docker tag student-service:latest gcr.io/PROJECT_ID/student-service:latest"
echo "  docker tag course-service:latest gcr.io/PROJECT_ID/course-service:latest"
echo "  docker tag enrollment-service:latest gcr.io/PROJECT_ID/enrollment-service:latest"
echo "  docker push gcr.io/PROJECT_ID/student-service:latest"
echo "  docker push gcr.io/PROJECT_ID/course-service:latest"
echo "  docker push gcr.io/PROJECT_ID/enrollment-service:latest"
