import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET course by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await db.query("SELECT * FROM courses WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

// PUT update course
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { title, description, max_capacity, price, level } = await request.json()

    const result = await db.query(
      "UPDATE courses SET title = $1, description = $2, max_capacity = $3, price = $4, level = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
      [title, description, max_capacity, price, level, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

// DELETE course
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await db.query("DELETE FROM courses WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
