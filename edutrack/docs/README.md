# EduTrack Microservices

A comprehensive learning management system built with microservices architecture. This system manages students, courses, and enrollments through three independent services.

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway / Ingress                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│    Student    │ │    Course     │ │  Enrollment   │
│    Service    │ │    Service    │ │    Service    │
│   (Port 3001) │ │   (Port 3002) │ │   (Port 3003) │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Students    │ │    Courses    │ │  Enrollments  │
│   Database    │ │   Database    │ │   Database    │
└───────────────┘ └───────────────┘ └───────────────┘
\`\`\`

## Services

### Student Service (Port 3001)
- **Purpose**: Manages student data (CRUD operations)
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/students` - List all students (with pagination)
  - `GET /api/students/:id` - Get student by ID
  - `POST /api/students` - Create new student
  - `PUT /api/students/:id` - Update student
  - `DELETE /api/students/:id` - Delete student

### Course Service (Port 3002)
- **Purpose**: Manages course catalog (CRUD operations)
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/courses` - List all courses (with filtering)
  - `GET /api/courses/:id` - Get course by ID
  - `POST /api/courses` - Create new course
  - `PUT /api/courses/:id` - Update course
  - `PATCH /api/courses/:id/enrollment` - Update enrollment count
  - `DELETE /api/courses/:id` - Delete course

### Enrollment Service (Port 3003)
- **Purpose**: Manages student-course enrollments
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/enrollments` - List all enrollments
  - `GET /api/enrollments/:id` - Get enrollment by ID
  - `GET /api/enrollments/student/:studentId` - Get enrollments by student
  - `POST /api/enrollments` - Create enrollment
  - `PUT /api/enrollments/:id` - Update enrollment
  - `DELETE /api/enrollments/:id` - Delete enrollment
  - `GET /api/enrollments/:id/history` - Get enrollment history

## Project Structure

\`\`\`
edutrack/
├── student-service/
│   ├── src/
│   │   └── index.js
│   ├── db/
│   │   └── init.sql
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── course-service/
│   ├── src/
│   │   └── index.js
│   ├── db/
│   │   └── init.sql
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── enrollment-service/
│   ├── src/
│   │   └── index.js
│   ├── db/
│   │   └── init.sql
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── infra/
│   ├── namespace.yaml
│   ├── secrets-template.yaml
│   ├── configmap.yaml
│   ├── student-service.yaml
│   ├── course-service.yaml
│   ├── enrollment-service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── scripts/
│   ├── init-multiple-dbs.sh
│   ├── build-all.sh
│   └── test-endpoints.sh
├── docs/
│   ├── README.md
│   ├── GCP-DEPLOYMENT.md
│   └── API-REFERENCE.md
└── docker-compose.yaml
\`\`\`

## Quick Start (Local Development)

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development without Docker)
- curl and jq (for testing)

### Using Docker Compose

1. **Clone and navigate to the project**:
   \`\`\`bash
   cd edutrack
   \`\`\`

2. **Start all services**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Verify services are running**:
   \`\`\`bash
   # Check health endpoints
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   curl http://localhost:3003/health
   \`\`\`

4. **Run test script**:
   \`\`\`bash
   chmod +x scripts/test-endpoints.sh
   ./scripts/test-endpoints.sh
   \`\`\`

5. **Stop services**:
   \`\`\`bash
   docker-compose down
   \`\`\`

### Manual Setup (Without Docker)

1. **Install PostgreSQL** and create databases:
   \`\`\`sql
   CREATE DATABASE edutrack_students;
   CREATE DATABASE edutrack_courses;
   CREATE DATABASE edutrack_enrollments;
   \`\`\`

2. **Initialize each database** with the respective SQL files in `*/db/init.sql`

3. **Start each service**:
   \`\`\`bash
   # Terminal 1 - Student Service
   cd student-service
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   npm start

   # Terminal 2 - Course Service
   cd course-service
   cp .env.example .env
   npm install
   npm start

   # Terminal 3 - Enrollment Service
   cd enrollment-service
   cp .env.example .env
   npm install
   npm start
   \`\`\`

## API Examples

### Create a Student
\`\`\`bash
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "phone": "555-1234"
  }'
\`\`\`

### Create a Course
\`\`\`bash
curl -X POST http://localhost:3002/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "course_code": "CS101",
    "title": "Introduction to Computer Science",
    "instructor_name": "Dr. Smith",
    "max_capacity": 30,
    "price": 199.99,
    "level": "Beginner"
  }'
\`\`\`

### Enroll a Student
\`\`\`bash
curl -X POST http://localhost:3003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1
  }'
\`\`\`

## Environment Variables

### Common Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | Service-specific |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | Service-specific |

### Enrollment Service Additional
| Variable | Description | Default |
|----------|-------------|---------|
| `STUDENT_SERVICE_URL` | Student service URL | `http://localhost:3001` |
| `COURSE_SERVICE_URL` | Course service URL | `http://localhost:3002` |

## Deployment

See [GCP-DEPLOYMENT.md](./GCP-DEPLOYMENT.md) for detailed Google Cloud Platform deployment instructions.

## License

MIT License
