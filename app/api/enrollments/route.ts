import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET all enrollments with student and course details
export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT 
        e.id,
        e.student_id,
        e.course_id,
        e.enrollment_date,
        e.completion_status,
        e.progress_percentage,
        e.certificate_issued,
        s.full_name as student_name,
        s.email as student_email,
        c.title as course_title,
        c.course_code
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrollment_date DESC
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}

// POST new enrollment
export async function POST(request: NextRequest) {
  try {
    const { student_id, course_id } = await request.json()

    if (!student_id || !course_id) {
      return NextResponse.json({ error: "Student ID and Course ID are required" }, { status: 400 })
    }

    // Check if student and course exist
    const studentCheck = await db.query("SELECT id FROM students WHERE id = $1", [student_id])
    const courseCheck = await db.query("SELECT id, max_capacity, enrolled_count FROM courses WHERE id = $1", [
      course_id,
    ])

    if (studentCheck.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (courseCheck.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const course = courseCheck.rows[0]
    if (course.enrolled_count >= course.max_capacity) {
      return NextResponse.json({ error: "Course is full" }, { status: 400 })
    }

    // Create enrollment
    const result = await db.query("INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *", [
      student_id,
      course_id,
    ])

    // Update course enrolled count
    await db.query("UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = $1", [course_id])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    if (error.message.includes("unique constraint")) {
      return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}
