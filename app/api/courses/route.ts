import { type NextRequest, NextResponse } from "next/server"

const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || "http://localhost:3002"

// GET all courses
export async function GET(request: NextRequest) {
  try {
    // Pass query parameters
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${COURSE_SERVICE_URL}/api/courses?${searchParams}`

    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Service Error" }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data.data || data)
  } catch (error) {
    console.error("Course Service Error:", error)
    return NextResponse.json({ error: "Failed to fetch courses from service" }, { status: 500 })
  }
}

// POST new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${COURSE_SERVICE_URL}/api/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Course Service Error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
