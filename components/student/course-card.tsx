"use client"

import { useState } from "react"
import { enrollmentApi } from "@/lib/api-client"
import { Clock, Users, DollarSign } from "lucide-react"

interface CourseCardProps {
  id: number
  title: string
  description: string
  instructor_name: string
  category: string
  level: string
  duration_weeks: number
  enrolled_count: number
  max_capacity: number
  price: number
  onEnroll?: () => void
}

export function CourseCard({
  id,
  title,
  description,
  instructor_name,
  category,
  level,
  duration_weeks,
  enrolled_count,
  max_capacity,
  price,
  onEnroll,
}: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false)
  const isFull = enrolled_count >= max_capacity

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      // In a real app, you'd get the student_id from auth context
      await enrollmentApi.create({
        student_id: 1, // This should come from auth
        course_id: id,
      })
      onEnroll?.()
    } catch (error) {
      console.error("Failed to enroll:", error)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gradient-to-r from-primary to-accent opacity-80" />

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
              {category}
            </span>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
          <span className="px-2 py-1 bg-chart-1/20 text-chart-1 text-xs font-medium rounded">{level}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>

        <p className="text-sm font-medium text-foreground mb-4">Instructor: {instructor_name}</p>

        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration_weeks}w</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {enrolled_count}/{max_capacity}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>${price.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleEnroll}
          disabled={enrolling || isFull}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            isFull
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : enrolling
                ? "bg-primary text-primary-foreground opacity-50"
                : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {isFull ? "Course Full" : enrolling ? "Enrolling..." : "Enroll Now"}
        </button>
      </div>
    </div>
  )
}
