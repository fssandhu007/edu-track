const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const { Pool } = require("pg")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "edutrack_students",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
})

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1")
    res.status(200).json({
      status: "healthy",
      service: "student-service",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "student-service",
      error: error.message,
    })
  }
})

// Validation middleware
const validateStudent = (req, res, next) => {
  const { email, full_name } = req.body

  if (!email || !full_name) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Email and full_name are required fields",
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Invalid email format",
    })
  }

  next()
}

// GET all students
app.get("/api/students", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const offset = (page - 1) * limit

    let query = "SELECT * FROM students"
    let countQuery = "SELECT COUNT(*) FROM students"
    const params = []

    if (search) {
      query += " WHERE full_name ILIKE $1 OR email ILIKE $1"
      countQuery += " WHERE full_name ILIKE $1 OR email ILIKE $1"
      params.push(`%${search}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ])

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
    console.error("Error fetching students:", error)
    res.status(500).json({ error: "Failed to fetch students", message: error.message })
  }
})

// GET student by ID
app.get("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid student ID" })
    }

    const result = await pool.query("SELECT * FROM students WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching student:", error)
    res.status(500).json({ error: "Failed to fetch student", message: error.message })
  }
})

// POST create new student
app.post("/api/students", validateStudent, async (req, res) => {
  try {
    const { email, full_name, phone, bio, profile_image_url } = req.body

    const result = await pool.query(
      `INSERT INTO students (email, full_name, phone, bio, profile_image_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [email, full_name, phone || null, bio || null, profile_image_url || null],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating student:", error)

    if (error.code === "23505") {
      // Unique violation
      return res.status(409).json({ error: "Email already exists" })
    }

    res.status(500).json({ error: "Failed to create student", message: error.message })
  }
})

// PUT update student
app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { full_name, phone, bio, profile_image_url } = req.body

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid student ID" })
    }

    const result = await pool.query(
      `UPDATE students 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           bio = COALESCE($3, bio),
           profile_image_url = COALESCE($4, profile_image_url),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
      [full_name, phone, bio, profile_image_url, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating student:", error)
    res.status(500).json({ error: "Failed to update student", message: error.message })
  }
})

// DELETE student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid student ID" })
    }

    const result = await pool.query("DELETE FROM students WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" })
    }

    res.json({ message: "Student deleted successfully", id: result.rows[0].id })
  } catch (error) {
    console.error("Error deleting student:", error)
    res.status(500).json({ error: "Failed to delete student", message: error.message })
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
  console.log(`Student Service running on port ${PORT}`)
})

module.exports = app
