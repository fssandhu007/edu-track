# EduTrack API Reference

Complete API documentation for all EduTrack microservices.

## Base URLs

| Service | Local URL | Production URL |
|---------|-----------|----------------|
| Student Service | `http://localhost:3001` | `https://api.yourdomain.com` |
| Course Service | `http://localhost:3002` | `https://api.yourdomain.com` |
| Enrollment Service | `http://localhost:3003` | `https://api.yourdomain.com` |

## Common Response Formats

### Success Response
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error type",
  "message": "Detailed error message"
}
\`\`\`

## Student Service API

### Health Check
\`\`\`
GET /health
\`\`\`

**Response (200 OK)**
\`\`\`json
{
  "status": "healthy",
  "service": "student-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

---

### List Students
\`\`\`
GET /api/students
\`\`\`

**Query Parameters**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page | 10 |
| search | string | Search by name or email | - |

**Response (200 OK)**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "full_name": "John Doe",
      "phone": "555-1234",
      "bio": "Student bio",
      "profile_image_url": null,
      "enrollment_date": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
\`\`\`

---

### Get Student by ID
\`\`\`
GET /api/students/:id
\`\`\`

**Response (200 OK)**
\`\`\`json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "555-1234",
  "bio": "Student bio",
  "profile_image_url": null,
  "enrollment_date": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
\`\`\`

**Response (404 Not Found)**
\`\`\`json
{
  "error": "Student not found"
}
\`\`\`

---

### Create Student
\`\`\`
POST /api/students
\`\`\`

**Request Body**
\`\`\`json
{
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "555-1234",
  "bio": "Optional bio",
  "profile_image_url": "https://example.com/image.jpg"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Unique email address |
| full_name | string | Yes | Student's full name |
| phone | string | No | Phone number |
| bio | string | No | Short biography |
| profile_image_url | string | No | Profile image URL |

**Response (201 Created)**
\`\`\`json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  ...
}
\`\`\`

**Response (400 Bad Request)**
\`\`\`json
{
  "error": "Validation failed",
  "message": "Email and full_name are required fields"
}
\`\`\`

**Response (409 Conflict)**
\`\`\`json
{
  "error": "Email already exists"
}
\`\`\`

---

### Update Student
\`\`\`
PUT /api/students/:id
\`\`\`

**Request Body**
\`\`\`json
{
  "full_name": "John Smith",
  "phone": "555-5678",
  "bio": "Updated bio"
}
\`\`\`

**Response (200 OK)**
\`\`\`json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Smith",
  ...
}
\`\`\`

---

### Delete Student
\`\`\`
DELETE /api/students/:id
\`\`\`

**Response (200 OK)**
\`\`\`json
{
  "message": "Student deleted successfully",
  "id": 1
}
\`\`\`

---

## Course Service API

### Health Check
\`\`\`
GET /health
\`\`\`

---

### List Courses
\`\`\`
GET /api/courses
\`\`\`

**Query Parameters**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page | 10 |
| category | string | Filter by category | - |
| level | string | Filter by level | - |
| search | string | Search by title or code | - |

**Response (200 OK)**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "course_code": "CS101",
      "title": "Introduction to Computer Science",
      "description": "Course description",
      "instructor_name": "Dr. Smith",
      "max_capacity": 30,
      "enrolled_count": 15,
      "duration_weeks": 12,
      "price": 199.99,
      "image_url": null,
      "category": "Computer Science",
      "level": "Beginner",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
\`\`\`

---

### Get Course by ID
\`\`\`
GET /api/courses/:id
\`\`\`

---

### Create Course
\`\`\`
POST /api/courses
\`\`\`

**Request Body**
\`\`\`json
{
  "course_code": "CS101",
  "title": "Introduction to Computer Science",
  "description": "Learn the fundamentals",
  "instructor_name": "Dr. Smith",
  "max_capacity": 30,
  "duration_weeks": 12,
  "price": 199.99,
  "category": "Computer Science",
  "level": "Beginner"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| course_code | string | Yes | Unique course code |
| title | string | Yes | Course title |
| description | string | No | Course description |
| instructor_name | string | No | Instructor name |
| max_capacity | number | No | Maximum students (default: 30) |
| duration_weeks | number | No | Course duration |
| price | number | No | Course price (default: 0) |
| category | string | No | Course category |
| level | string | No | Difficulty level (default: Beginner) |

---

### Update Course
\`\`\`
PUT /api/courses/:id
\`\`\`

---

### Update Enrollment Count
\`\`\`
PATCH /api/courses/:id/enrollment
\`\`\`

**Request Body**
\`\`\`json
{
  "increment": true
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| increment | boolean | true to add, false to subtract |

---

### Delete Course
\`\`\`
DELETE /api/courses/:id
\`\`\`

---

## Enrollment Service API

### Health Check
\`\`\`
GET /health
\`\`\`

---

### List Enrollments
\`\`\`
GET /api/enrollments
\`\`\`

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| student_id | number | Filter by student |
| course_id | number | Filter by course |
| status | string | Filter by completion status |

**Response (200 OK)**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "enrollment_date": "2024-01-01T00:00:00.000Z",
      "completion_status": "In Progress",
      "progress_percentage": 50,
      "certificate_issued": false,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "course_title": "Introduction to CS",
      "course_code": "CS101"
    }
  ],
  "pagination": {...}
}
\`\`\`

---

### Get Enrollment by ID
\`\`\`
GET /api/enrollments/:id
\`\`\`

**Response (200 OK)**
\`\`\`json
{
  "id": 1,
  "student_id": 1,
  "course_id": 1,
  "enrollment_date": "2024-01-01T00:00:00.000Z",
  "completion_status": "In Progress",
  "progress_percentage": 50,
  "certificate_issued": false,
  "student": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe"
  },
  "course": {
    "id": 1,
    "course_code": "CS101",
    "title": "Introduction to CS"
  }
}
\`\`\`

---

### Get Enrollments by Student
\`\`\`
GET /api/enrollments/student/:studentId
\`\`\`

---

### Create Enrollment
\`\`\`
POST /api/enrollments
\`\`\`

**Request Body**
\`\`\`json
{
  "student_id": 1,
  "course_id": 1
}
\`\`\`

**Response (201 Created)**
\`\`\`json
{
  "id": 1,
  "student_id": 1,
  "course_id": 1,
  "enrollment_date": "2024-01-15T10:30:00.000Z",
  "completion_status": "In Progress",
  "progress_percentage": 0,
  "certificate_issued": false
}
\`\`\`

**Response (400 Bad Request)**
\`\`\`json
{
  "error": "Course is full"
}
\`\`\`

**Response (404 Not Found)**
\`\`\`json
{
  "error": "Student not found"
}
\`\`\`

**Response (409 Conflict)**
\`\`\`json
{
  "error": "Student is already enrolled in this course"
}
\`\`\`

---

### Update Enrollment
\`\`\`
PUT /api/enrollments/:id
\`\`\`

**Request Body**
\`\`\`json
{
  "completion_status": "Completed",
  "progress_percentage": 100,
  "certificate_issued": true
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| completion_status | string | Status: "In Progress", "Completed", "Dropped" |
| progress_percentage | number | 0-100 |
| certificate_issued | boolean | Certificate status |

---

### Delete Enrollment
\`\`\`
DELETE /api/enrollments/:id
\`\`\`

---

### Get Enrollment History
\`\`\`
GET /api/enrollments/:id/history
\`\`\`

**Response (200 OK)**
\`\`\`json
[
  {
    "id": 1,
    "enrollment_id": 1,
    "action": "STATUS_CHANGED",
    "previous_status": "In Progress",
    "new_status": "Completed",
    "changed_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "enrollment_id": 1,
    "action": "CREATED",
    "previous_status": null,
    "new_status": "In Progress",
    "changed_at": "2024-01-01T00:00:00.000Z"
  }
]
\`\`\`

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

Currently, there are no rate limits implemented. For production, consider adding:
- Request rate limiting per IP
- API key authentication
- JWT token authentication
