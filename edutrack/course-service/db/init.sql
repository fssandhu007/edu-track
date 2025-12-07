-- Course Service Database Initialization

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
