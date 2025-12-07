-- Create Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  profile_image_url VARCHAR(500),
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_name VARCHAR(255),
  max_capacity INT DEFAULT 30,
  enrolled_count INT DEFAULT 0,
  duration_weeks INT,
  price DECIMAL(10, 2) DEFAULT 0,
  image_url VARCHAR(500),
  category VARCHAR(100),
  level VARCHAR(50) DEFAULT 'Beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_status VARCHAR(50) DEFAULT 'In Progress',
  progress_percentage INT DEFAULT 0,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(student_id, course_id)
);

-- Create Enrollments History table for auditing
CREATE TABLE IF NOT EXISTS enrollment_history (
  id SERIAL PRIMARY KEY,
  enrollment_id INT NOT NULL,
  action VARCHAR(50),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollment_history_enrollment ON enrollment_history(enrollment_id);
