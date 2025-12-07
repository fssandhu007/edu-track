import { type NextRequest, NextResponse } from "next/server"

const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || "http://localhost:3003"

// GET all enrollments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${ENROLLMENT_SERVICE_URL}/api/enrollments?${searchParams}`

    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Service Error" }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    // enrollment-service returns { data: enrichedEnrollments, ... }
    return NextResponse.json(data.data || data)
  } catch (error) {
    console.error("Enrollment Service Error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments from service" }, { status: 500 })
  }
}

// POST new enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${ENROLLMENT_SERVICE_URL}/api/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Enrollment Service Error:", error)
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}
