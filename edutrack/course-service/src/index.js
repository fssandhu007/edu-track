const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const { Pool } = require("pg")

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "edutrack_courses",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
})

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1")
    res.status(200).json({
      status: "healthy",
      service: "course-service",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "course-service",
      error: error.message,
    })
  }
})

// Validation middleware
const validateCourse = (req, res, next) => {
  const { course_code, title } = req.body

  if (!course_code || !title) {
    return res.status(400).json({
      error: "Validation failed",
      message: "course_code and title are required fields",
    })
  }

  if (course_code.length < 3 || course_code.length > 50) {
    return res.status(400).json({
      error: "Validation failed",
      message: "course_code must be between 3 and 50 characters",
    })
  }

  next()
}

// GET all courses
app.get("/api/courses", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query
    const offset = (page - 1) * limit
    const conditions = []
    const params = []
    let paramIndex = 1

    if (category) {
      conditions.push(`category = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    if (level) {
      conditions.push(`level = $${paramIndex}`)
      params.push(level)
      paramIndex++
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR course_code ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    let query = "SELECT * FROM courses"
    let countQuery = "SELECT COUNT(*) FROM courses"

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ")
      query += whereClause
      countQuery += whereClause
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const countParams = params.slice(0, paramIndex - 1)

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, countParams)])

    res.json({
      data: result.rows,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ error: "Failed to fetch courses", message: error.message })
  }
})

// GET course by ID
app.get("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid course ID" })
    }

    const result = await pool.query("SELECT * FROM courses WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching course:", error)
    res.status(500).json({ error: "Failed to fetch course", message: error.message })
  }
})

// POST create new course
app.post("/api/courses", validateCourse, async (req, res) => {
  try {
    const {
      course_code,
      title,
      description,
      instructor_name,
      max_capacity = 30,
      duration_weeks,
      price = 0,
      image_url,
      category,
      level = "Beginner",
    } = req.body

    const result = await pool.query(
      `INSERT INTO courses (course_code, title, description, instructor_name, max_capacity, duration_weeks, price, image_url, category, level) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        course_code,
        title,
        description || null,
        instructor_name || null,
        max_capacity,
        duration_weeks || null,
        price,
        image_url || null,
        category || null,
        level,
      ],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating course:", error)

    if (error.code === "23505") {
      return res.status(409).json({ error: "Course code already exists" })
    }

    res.status(500).json({ error: "Failed to create course", message: error.message })
  }
})

// PUT update course
app.put("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, instructor_name, max_capacity, duration_weeks, price, image_url, category, level } =
      req.body

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid course ID" })
    }

    const result = await pool.query(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           instructor_name = COALESCE($3, instructor_name),
           max_capacity = COALESCE($4, max_capacity),
           duration_weeks = COALESCE($5, duration_weeks),
           price = COALESCE($6, price),
           image_url = COALESCE($7, image_url),
           category = COALESCE($8, category),
           level = COALESCE($9, level),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $10 
       RETURNING *`,
      [title, description, instructor_name, max_capacity, duration_weeks, price, image_url, category, level, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating course:", error)
    res.status(500).json({ error: "Failed to update course", message: error.message })
  }
})

// PATCH update enrolled count (used by enrollment service)
app.patch("/api/courses/:id/enrollment", async (req, res) => {
  try {
    const { id } = req.params
    const { increment } = req.body // true to increment, false to decrement

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid course ID" })
    }

    const operation = increment ? "+ 1" : "- 1"
    const result = await pool.query(
      `UPDATE courses 
       SET enrolled_count = GREATEST(0, enrolled_count ${operation}),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating enrollment count:", error)
    res.status(500).json({ error: "Failed to update enrollment count", message: error.message })
  }
})

// DELETE course
app.delete("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid course ID" })
    }

    const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" })
    }

    res.json({ message: "Course deleted successfully", id: result.rows[0].id })
  } catch (error) {
    console.error("Error deleting course:", error)
    res.status(500).json({ error: "Failed to delete course", message: error.message })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error", message: err.message })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path })
})

// Start server
app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`)
})

module.exports = app
