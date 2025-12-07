"use client"

import { useEffect, useState } from "react"
import { enrollmentApi } from "@/lib/api-client"
import { Trash2 } from "lucide-react"

interface Enrollment {
  id: number
  student_name: string
  student_email: string
  course_title: string
  completion_status: string
  progress_percentage: number
  enrollment_date: string
}

export function EnrollmentsTable() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const data = await enrollmentApi.getAll()
      setEnrollments(data)
    } catch (error) {
      console.error("Failed to fetch enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEnrollment = async (id: number) => {
    if (confirm("Are you sure you want to remove this enrollment?")) {
      try {
        await enrollmentApi.delete(id)
        setEnrollments(enrollments.filter((e) => e.id !== id))
      } catch (error) {
        console.error("Failed to delete enrollment:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading enrollments...</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Enrollments</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Course</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Progress</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Enrollment Date</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="border-b border-border hover:bg-secondary">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{enrollment.student_name}</p>
                    <p className="text-xs text-muted-foreground">{enrollment.student_email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{enrollment.course_title}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      enrollment.completion_status === "Completed"
                        ? "bg-chart-3/20 text-chart-3"
                        : enrollment.completion_status === "In Progress"
                          ? "bg-chart-1/20 text-chart-1"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {enrollment.completion_status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-chart-1 h-2 rounded-full"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{enrollment.progress_percentage}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">{new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => deleteEnrollment(enrollment.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
