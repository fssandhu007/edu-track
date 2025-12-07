import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET all students
export async function GET(request: NextRequest) {
  try {
    const result = await db.query("SELECT * FROM students ORDER BY created_at DESC")
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// POST new student
export async function POST(request: NextRequest) {
  try {
    const { email, full_name, phone, bio } = await request.json()

    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and full name are required" }, { status: 400 })
    }

    const result = await db.query(
      "INSERT INTO students (email, full_name, phone, bio) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, full_name, phone, bio],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    if (error.message.includes("unique constraint")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
