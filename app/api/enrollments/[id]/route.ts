import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// PUT update enrollment
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { completion_status, progress_percentage } = await request.json()

    const result = await db.query(
      "UPDATE enrollments SET completion_status = $1, progress_percentage = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [completion_status, progress_percentage, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 })
  }
}

// DELETE enrollment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get enrollment to find course_id
    const enrollmentResult = await db.query("SELECT course_id FROM enrollments WHERE id = $1", [id])

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    const course_id = enrollmentResult.rows[0].course_id

    // Delete enrollment
    await db.query("DELETE FROM enrollments WHERE id = $1", [id])

    // Decrement course enrolled count
    await db.query("UPDATE courses SET enrolled_count = enrolled_count - 1 WHERE id = $1", [course_id])

    return NextResponse.json({ message: "Enrollment deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 })
  }
}
