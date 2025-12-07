#!/bin/bash

# Function to get External IP
get_external_ip() {
    local service_name=$1
    local ip=""
    while [ -z "$ip" ]; do
        ip=$(kubectl get svc $service_name -n edutrack -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
        if [ -z "$ip" ]; then
            sleep 5
        fi
    done
    echo $ip
}

echo "--------------------------------------------------"
echo "Fetching Service IPs..."
echo "--------------------------------------------------"

STUDENT_IP=$(get_external_ip "student-service")
COURSE_IP=$(get_external_ip "course-service")
ENROLLMENT_IP=$(get_external_ip "enrollment-service")

echo "Student Service IP: $STUDENT_IP"
echo "Course Service IP: $COURSE_IP"
echo "Enrollment Service IP: $ENROLLMENT_IP"
echo "--------------------------------------------------"

# 1. Health Checks
echo "1. Testing Health Endpoints..."
curl "http://$STUDENT_IP:3001/health" | grep "healthy" && echo "Student Service: OK" || echo "Student Service: FAILED"
curl -s "http://$COURSE_IP:3002/health" | grep "healthy" && echo "Course Service: OK" || echo "Course Service: FAILED"
curl -s "http://$ENROLLMENT_IP:3003/health" | grep "healthy" && echo "Enrollment Service: OK" || echo "Enrollment Service: FAILED"
echo "--------------------------------------------------"

# 2. Create Student
echo "2. Creating a Student..."
STUDENT_RESPONSE=$(curl -s -X POST "http://$STUDENT_IP:3001/api/students" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test.student@example.com",
        "full_name": "Test Student",
        "date_of_birth": "2000-01-01"
    }')
echo "Response: $STUDENT_RESPONSE"
STUDENT_ID=$(echo $STUDENT_RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "Created Student ID: $STUDENT_ID"
echo "--------------------------------------------------"

# 3. Create Course
echo "3. Creating a Course..."
COURSE_RESPONSE=$(curl -s -X POST "http://$COURSE_IP:3002/api/courses" \
    -H "Content-Type: application/json" \
    -d '{
        "course_code": "CS101",
        "title": "Intro to Computer Science",
        "description": "Basic concepts of programming",
        "instructor_name": "Dr. Smith",
        "max_capacity": 50,
        "price": 100
    }')
echo "Response: $COURSE_RESPONSE"
COURSE_ID=$(echo $COURSE_RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "Created Course ID: $COURSE_ID"
echo "--------------------------------------------------"

# 4. Enroll Student
if [[ -n "$STUDENT_ID" && -n "$COURSE_ID" ]]; then
    echo "4. Enrolling Student ($STUDENT_ID) in Course ($COURSE_ID)..."
    ENROLL_RESPONSE=$(curl -s -X POST "http://$ENROLLMENT_IP:3003/api/enrollments" \
        -H "Content-Type: application/json" \
        -d "{
            \"student_id\": $STUDENT_ID,
            \"course_id\": $COURSE_ID
        }")
    echo "Response: $ENROLL_RESPONSE"
else
    echo "Skipping enrollment test due to missing IDs."
fi
echo "--------------------------------------------------"

# 5. List Enrollments
echo "5. Listing All Enrollments..."
curl -s "http://$ENROLLMENT_IP:3003/api/enrollments"
echo ""
echo "--------------------------------------------------"
