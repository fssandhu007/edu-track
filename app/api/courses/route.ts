import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET all courses
export async function GET(request: NextRequest) {
  try {
    const result = await db.query("SELECT * FROM courses ORDER BY created_at DESC")
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST new course
export async function POST(request: NextRequest) {
  try {
    const { course_code, title, description, instructor_name, max_capacity, duration_weeks, price, category, level } =
      await request.json()

    if (!course_code || !title) {
      return NextResponse.json({ error: "Course code and title are required" }, { status: 400 })
    }

    const result = await db.query(
      "INSERT INTO courses (course_code, title, description, instructor_name, max_capacity, duration_weeks, price, category, level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [course_code, title, description, instructor_name, max_capacity, duration_weeks, price, category, level],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    if (error.message.includes("unique constraint")) {
      return NextResponse.json({ error: "Course code already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
