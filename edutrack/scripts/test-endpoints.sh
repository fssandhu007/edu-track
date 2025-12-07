#!/bin/bash
# Test all service endpoints

set -e

BASE_URL=${1:-"http://localhost"}

echo "Testing EduTrack Microservices..."
echo "=================================="

# Test Student Service
echo -e "\n[Student Service - Health Check]"
curl -s "${BASE_URL}:3001/health" | jq .

echo -e "\n[Student Service - Create Student]"
STUDENT=$(curl -s -X POST "${BASE_URL}:3001/api/students" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "full_name": "Test Student", "phone": "123-456-7890"}')
echo $STUDENT | jq .
STUDENT_ID=$(echo $STUDENT | jq -r '.id')

echo -e "\n[Student Service - Get All Students]"
curl -s "${BASE_URL}:3001/api/students" | jq .

echo -e "\n[Student Service - Get Student by ID]"
curl -s "${BASE_URL}:3001/api/students/${STUDENT_ID}" | jq .

# Test Course Service
echo -e "\n[Course Service - Health Check]"
curl -s "${BASE_URL}:3002/health" | jq .

echo -e "\n[Course Service - Create Course]"
COURSE=$(curl -s -X POST "${BASE_URL}:3002/api/courses" \
  -H "Content-Type: application/json" \
  -d '{"course_code": "CS101", "title": "Introduction to Computer Science", "instructor_name": "Dr. Smith", "max_capacity": 30, "price": 199.99, "level": "Beginner"}')
echo $COURSE | jq .
COURSE_ID=$(echo $COURSE | jq -r '.id')

echo -e "\n[Course Service - Get All Courses]"
curl -s "${BASE_URL}:3002/api/courses" | jq .

echo -e "\n[Course Service - Get Course by ID]"
curl -s "${BASE_URL}:3002/api/courses/${COURSE_ID}" | jq .

# Test Enrollment Service
echo -e "\n[Enrollment Service - Health Check]"
curl -s "${BASE_URL}:3003/health" | jq .

echo -e "\n[Enrollment Service - Create Enrollment]"
ENROLLMENT=$(curl -s -X POST "${BASE_URL}:3003/api/enrollments" \
  -H "Content-Type: application/json" \
  -d "{\"student_id\": ${STUDENT_ID}, \"course_id\": ${COURSE_ID}}")
echo $ENROLLMENT | jq .
ENROLLMENT_ID=$(echo $ENROLLMENT | jq -r '.id')

echo -e "\n[Enrollment Service - Get All Enrollments]"
curl -s "${BASE_URL}:3003/api/enrollments" | jq .

echo -e "\n[Enrollment Service - Update Enrollment Progress]"
curl -s -X PUT "${BASE_URL}:3003/api/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{"progress_percentage": 50, "completion_status": "In Progress"}' | jq .

echo -e "\n[Enrollment Service - Get Enrollment History]"
curl -s "${BASE_URL}:3003/api/enrollments/${ENROLLMENT_ID}/history" | jq .

echo -e "\n=================================="
echo "All tests completed!"
echo ""
echo "Created resources:"
echo "  Student ID: ${STUDENT_ID}"
echo "  Course ID: ${COURSE_ID}"
echo "  Enrollment ID: ${ENROLLMENT_ID}"
