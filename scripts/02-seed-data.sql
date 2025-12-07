-- Insert sample students
INSERT INTO students (email, full_name, phone, bio, profile_image_url) VALUES
('john.doe@example.com', 'John Doe', '555-0101', 'Full-stack developer interested in web technologies', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'),
('jane.smith@example.com', 'Jane Smith', '555-0102', 'Data scientist with passion for machine learning', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'),
('bob.wilson@example.com', 'Bob Wilson', '555-0103', 'Aspiring product manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
('alice.johnson@example.com', 'Alice Johnson', '555-0104', 'Mobile app developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
('charlie.brown@example.com', 'Charlie Brown', '555-0105', 'DevOps engineer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (course_code, title, description, instructor_name, max_capacity, duration_weeks, price, category, level, image_url) VALUES
('CS101', 'Introduction to Web Development', 'Learn HTML, CSS, and JavaScript fundamentals', 'Sarah Mitchell', 30, 8, 299.99, 'Web Development', 'Beginner', '/placeholder.svg?height=200&width=300'),
('CS102', 'React Advanced Patterns', 'Master advanced React concepts and patterns', 'Mike Johnson', 25, 10, 399.99, 'Web Development', 'Intermediate', '/placeholder.svg?height=200&width=300'),
('CS201', 'Machine Learning Fundamentals', 'Introduction to ML algorithms and applications', 'Dr. Emily Chen', 20, 12, 499.99, 'Data Science', 'Intermediate', '/placeholder.svg?height=200&width=300'),
('CS202', 'Data Analysis with Python', 'Master data analysis using Python and Pandas', 'James Wilson', 30, 8, 349.99, 'Data Science', 'Beginner', '/placeholder.svg?height=200&width=300'),
('CS301', 'DevOps & Cloud Deployment', 'Learn Docker, Kubernetes, and cloud deployment', 'Alex Rodriguez', 15, 10, 549.99, 'DevOps', 'Advanced', '/placeholder.svg?height=200&width=300'),
('CS302', 'Mobile App Development', 'Build cross-platform mobile apps with React Native', 'Lisa Chang', 25, 12, 449.99, 'Mobile Development', 'Intermediate', '/placeholder.svg?height=200&width=300')
ON CONFLICT (course_code) DO NOTHING;

-- Insert sample enrollments
INSERT INTO enrollments (student_id, course_id, completion_status, progress_percentage) VALUES
(1, 1, 'In Progress', 45),
(1, 2, 'Completed', 100),
(2, 3, 'In Progress', 60),
(3, 1, 'Not Started', 0),
(4, 4, 'In Progress', 75),
(5, 5, 'In Progress', 30)
ON CONFLICT (student_id, course_id) DO NOTHING;
