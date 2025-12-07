-- Student Service Database Initialization

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);
