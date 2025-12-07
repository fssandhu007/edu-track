const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const { Pool } = require("pg")

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "edutrack_enrollments",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
})

// Service URLs for inter-service communication
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || "http://localhost:3001"
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || "http://localhost:3002"

// Helper function for HTTP requests
async function fetchService(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1")
    res.status(200).json({
      status: "healthy",
      service: "enrollment-service",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "enrollment-service",
      error: error.message,
    })
  }
})

// Validation middleware
const validateEnrollment = (req, res, next) => {
  const { student_id, course_id } = req.body

  if (!student_id || !course_id) {
    return res.status(400).json({
      error: "Validation failed",
      message: "student_id and course_id are required fields",
    })
  }

  if (isNaN(student_id) || isNaN(course_id)) {
    return res.status(400).json({
      error: "Validation failed",
      message: "student_id and course_id must be valid numbers",
    })
  }

  next()
}

// GET all enrollments with enriched data
app.get("/api/enrollments", async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, course_id, status } = req.query
    const offset = (page - 1) * limit
    const conditions = []
    const params = []
    let paramIndex = 1

    if (student_id) {
      conditions.push(`student_id = $${paramIndex}`)
      params.push(student_id)
      paramIndex++
    }

    if (course_id) {
      conditions.push(`course_id = $${paramIndex}`)
      params.push(course_id)
      paramIndex++
    }

    if (status) {
      conditions.push(`completion_status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    let query = "SELECT * FROM enrollments"
    let countQuery = "SELECT COUNT(*) FROM enrollments"

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ")
      query += whereClause
      countQuery += whereClause
    }

    query += ` ORDER BY enrollment_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const countParams = params.slice(0, paramIndex - 1)

    const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQuery, countParams)])

    // Enrich enrollment data with student and course info
    const enrichedEnrollments = await Promise.all(
      result.rows.map(async (enrollment) => {
        try {
          const [student, course] = await Promise.all([
            fetchService(`${STUDENT_SERVICE_URL}/api/students/${enrollment.student_id}`).catch(() => null),
            fetchService(`${COURSE_SERVICE_URL}/api/courses/${enrollment.course_id}`).catch(() => null),
          ])

          return {
            ...enrollment,
            student_name: student?.full_name || "Unknown",
            student_email: student?.email || "Unknown",
            course_title: course?.title || "Unknown",
            course_code: course?.course_code || "Unknown",
          }
        } catch (error) {
          return {
            ...enrollment,
            student_name: "Unknown",
            student_email: "Unknown",
            course_title: "Unknown",
            course_code: "Unknown",
          }
        }
      }),
    )

    res.json({
      data: enrichedEnrollments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    res.status(500).json({ error: "Failed to fetch enrollments", message: error.message })
  }
})

// GET enrollment by ID
app.get("/api/enrollments/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid enrollment ID" })
    }

    const result = await pool.query("SELECT * FROM enrollments WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Enrollment not found" })
    }

    const enrollment = result.rows[0]

    // Enrich with student and course data
    try {
      const [student, course] = await Promise.all([
        fetchService(`${STUDENT_SERVICE_URL}/api/students/${enrollment.student_id}`).catch(() => null),
        fetchService(`${COURSE_SERVICE_URL}/api/courses/${enrollment.course_id}`).catch(() => null),
      ])

      res.json({
        ...enrollment,
        student,
        course,
      })
    } catch (error) {
      res.json(enrollment)
    }
  } catch (error) {
    console.error("Error fetching enrollment:", error)
    res.status(500).json({ error: "Failed to fetch enrollment", message: error.message })
  }
})

// GET enrollments by student ID
app.get("/api/enrollments/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params

    if (isNaN(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" })
    }

    const result = await pool.query("SELECT * FROM enrollments WHERE student_id = $1 ORDER BY enrollment_date DESC", [
      studentId,
    ])

    // Enrich with course data
    const enrichedEnrollments = await Promise.all(
      result.rows.map(async (enrollment) => {
        try {
          const course = await fetchService(`${COURSE_SERVICE_URL}/api/courses/${enrollment.course_id}`)
          return {
            ...enrollment,
            course_title: course?.title,
            course_code: course?.course_code,
            course,
          }
        } catch (error) {
          return enrollment
        }
      }),
    )

    res.json(enrichedEnrollments)
  } catch (error) {
    console.error("Error fetching student enrollments:", error)
    res.status(500).json({ error: "Failed to fetch student enrollments", message: error.message })
  }
})

// POST create new enrollment
app.post("/api/enrollments", validateEnrollment, async (req, res) => {
  try {
    const { student_id, course_id } = req.body

    // Verify student exists
    try {
      await fetchService(`${STUDENT_SERVICE_URL}/api/students/${student_id}`)
    } catch (error) {
      return res.status(404).json({ error: "Student not found" })
    }

    // Verify course exists and has capacity
    let course
    try {
      course = await fetchService(`${COURSE_SERVICE_URL}/api/courses/${course_id}`)
    } catch (error) {
      return res.status(404).json({ error: "Course not found" })
    }

    if (course.enrolled_count >= course.max_capacity) {
      return res.status(400).json({ error: "Course is full" })
    }

    // Check if already enrolled
    const existingEnrollment = await pool.query("SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2", [
      student_id,
      course_id,
    ])

    if (existingEnrollment.rows.length > 0) {
      return res.status(409).json({ error: "Student is already enrolled in this course" })
    }

    // Create enrollment
    const result = await pool.query("INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *", [
      student_id,
      course_id,
    ])

    // Update course enrolled count
    try {
      await fetchService(`${COURSE_SERVICE_URL}/api/courses/${course_id}/enrollment`, {
        method: "PATCH",
        body: JSON.stringify({ increment: true }),
      })
    } catch (error) {
      console.error("Failed to update course enrollment count:", error)
    }

    // Log to enrollment history
    await pool.query("INSERT INTO enrollment_history (enrollment_id, action, new_status) VALUES ($1, $2, $3)", [
      result.rows[0].id,
      "CREATED",
      "In Progress",
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating enrollment:", error)
    res.status(500).json({ error: "Failed to create enrollment", message: error.message })
  }
})

// PUT update enrollment
app.put("/api/enrollments/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { completion_status, progress_percentage, certificate_issued } = req.body

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid enrollment ID" })
    }

    // Get current enrollment for history
    const currentEnrollment = await pool.query("SELECT * FROM enrollments WHERE id = $1", [id])

    if (currentEnrollment.rows.length === 0) {
      return res.status(404).json({ error: "Enrollment not found" })
    }

    const previous_status = currentEnrollment.rows[0].completion_status

    const result = await pool.query(
      `UPDATE enrollments 
       SET completion_status = COALESCE($1, completion_status),
           progress_percentage = COALESCE($2, progress_percentage),
           certificate_issued = COALESCE($3, certificate_issued),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [completion_status, progress_percentage, certificate_issued, id],
    )

    // Log status change to history
    if (completion_status && completion_status !== previous_status) {
      await pool.query(
        "INSERT INTO enrollment_history (enrollment_id, action, previous_status, new_status) VALUES ($1, $2, $3, $4)",
        [id, "STATUS_CHANGED", previous_status, completion_status],
      )
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating enrollment:", error)
    res.status(500).json({ error: "Failed to update enrollment", message: error.message })
  }
})

// DELETE enrollment
app.delete("/api/enrollments/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid enrollment ID" })
    }

    // Get enrollment to find course_id
    const enrollmentResult = await pool.query("SELECT course_id FROM enrollments WHERE id = $1", [id])

    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ error: "Enrollment not found" })
    }

    const course_id = enrollmentResult.rows[0].course_id

    // Delete enrollment
    await pool.query("DELETE FROM enrollments WHERE id = $1", [id])

    // Update course enrolled count
    try {
      await fetchService(`${COURSE_SERVICE_URL}/api/courses/${course_id}/enrollment`, {
        method: "PATCH",
        body: JSON.stringify({ increment: false }),
      })
    } catch (error) {
      console.error("Failed to update course enrollment count:", error)
    }

    res.json({ message: "Enrollment deleted successfully", id: Number.parseInt(id) })
  } catch (error) {
    console.error("Error deleting enrollment:", error)
    res.status(500).json({ error: "Failed to delete enrollment", message: error.message })
  }
})

// GET enrollment history
app.get("/api/enrollments/:id/history", async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid enrollment ID" })
    }

    const result = await pool.query(
      "SELECT * FROM enrollment_history WHERE enrollment_id = $1 ORDER BY changed_at DESC",
      [id],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching enrollment history:", error)
    res.status(500).json({ error: "Failed to fetch enrollment history", message: error.message })
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
  console.log(`Enrollment Service running on port ${PORT}`)
})

module.exports = app
