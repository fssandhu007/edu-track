import { type NextRequest, NextResponse } from "next/server"

const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || "http://localhost:3001"

// GET all students
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${STUDENT_SERVICE_URL}/api/students`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Service Error" }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    // The service returns { data: [...], pagination: {...} } or just [...] depending on implementation.
    // Based on previous checks, student-service returns { data: ... }
    return NextResponse.json(data.data || data)
  } catch (error) {
    console.error("Student Service Error:", error)
    return NextResponse.json({ error: "Failed to fetch students from service" }, { status: 500 })
  }
}

// POST new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${STUDENT_SERVICE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error("Student Service Error:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
