-- Enrollment Service Database Initialization

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
  UNIQUE(student_id, course_id)
);

-- Enrollment history for auditing
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
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(completion_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_date ON enrollments(enrollment_date DESC);
CREATE INDEX IF NOT EXISTS idx_enrollment_history_enrollment ON enrollment_history(enrollment_id);
