"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { courseApi } from "@/lib/api-client"
import { Edit2, Trash2, Plus } from "lucide-react"

interface Course {
  id: number
  course_code: string
  title: string
  category: string
  level: string
  enrolled_count: number
  max_capacity: number
  price: number
}

export function CoursesTable() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll()
      setCourses(data)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await courseApi.delete(id)
        setCourses(courses.filter((c) => c.id !== id))
      } catch (error) {
        console.error("Failed to delete course:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Courses</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {showForm && <CourseForm onSuccess={fetchCourses} onClose={() => setShowForm(false)} />}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-sm">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Level</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Enrolled</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border hover:bg-secondary">
                <td className="py-3 px-4">{course.course_code}</td>
                <td className="py-3 px-4">{course.title}</td>
                <td className="py-3 px-4">{course.category}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-chart-1/20 text-chart-1 rounded text-xs font-medium">
                    {course.level}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {course.enrolled_count}/{course.max_capacity}
                </td>
                <td className="py-3 px-4">${course.price.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface CourseFormProps {
  onSuccess: () => void
  onClose: () => void
}

function CourseForm({ onSuccess, onClose }: CourseFormProps) {
  const [formData, setFormData] = useState({
    course_code: "",
    title: "",
    description: "",
    instructor_name: "",
    max_capacity: 30,
    duration_weeks: 8,
    price: 0,
    category: "Web Development",
    level: "Beginner",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await courseApi.create(formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to create course:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 mb-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Course Code"
          value={formData.course_code}
          onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
          required
        />
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
          required
        />
      </div>
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        rows={3}
      />
      <div className="grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Instructor"
          value={formData.instructor_name}
          onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        />
        <input
          type="number"
          placeholder="Capacity"
          value={formData.max_capacity}
          onChange={(e) => setFormData({ ...formData, max_capacity: Number.parseInt(e.target.value) })}
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
