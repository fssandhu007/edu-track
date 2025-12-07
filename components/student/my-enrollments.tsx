"use client"

import { useEffect, useState } from "react"
import { enrollmentApi } from "@/lib/api-client"
import { Award, Clock } from "lucide-react"

interface Enrollment {
  id: number
  course_title: string
  course_code: string
  completion_status: string
  progress_percentage: number
  certificate_issued: boolean
  enrollment_date: string
}

export function MyEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await enrollmentApi.getAll()
        // Filter to show only current student's enrollments
        setEnrollments(data.slice(0, 3))
      } catch (error) {
        console.error("Failed to fetch enrollments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading your courses...</div>
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">You haven't enrolled in any courses yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => (
        <div key={enrollment.id} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{enrollment.course_title}</h3>
              <p className="text-sm text-muted-foreground">{enrollment.course_code}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  enrollment.completion_status === "Completed"
                    ? "bg-chart-3/20 text-chart-3"
                    : "bg-chart-1/20 text-chart-1"
                }`}
              >
                {enrollment.completion_status}
              </span>
              {enrollment.certificate_issued && (
                <span className="px-2 py-1 bg-chart-4/20 text-chart-4 rounded text-xs font-medium flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Certificate
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{enrollment.progress_percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-chart-1 h-2 rounded-full transition-all"
                  style={{ width: `${enrollment.progress_percentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
