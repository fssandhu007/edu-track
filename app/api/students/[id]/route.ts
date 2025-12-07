import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET student by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await db.query("SELECT * FROM students WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

// PUT update student
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { full_name, phone, bio } = await request.json()

    const result = await db.query(
      "UPDATE students SET full_name = $1, phone = $2, bio = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [full_name, phone, bio, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await db.query("DELETE FROM students WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
