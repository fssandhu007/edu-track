"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { studentApi } from "@/lib/api-client"
import { Edit2, Trash2, Plus } from "lucide-react"

interface Student {
  id: number
  email: string
  full_name: string
  phone: string
  bio: string
  enrollment_date: string
}

export function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await studentApi.getAll()
      setStudents(data)
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await studentApi.delete(id)
        setStudents(students.filter((s) => s.id !== id))
      } catch (error) {
        console.error("Failed to delete student:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Students</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {showForm && <StudentForm onSuccess={fetchStudents} onClose={() => setShowForm(false)} />}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Phone</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Enrollment Date</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border hover:bg-secondary">
                <td className="py-3 px-4">{student.full_name}</td>
                <td className="py-3 px-4">{student.email}</td>
                <td className="py-3 px-4">{student.phone}</td>
                <td className="py-3 px-4">{new Date(student.enrollment_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
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

interface StudentFormProps {
  onSuccess: () => void
  onClose: () => void
}

function StudentForm({ onSuccess, onClose }: StudentFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    bio: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await studentApi.create(formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to create student:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 mb-4 space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
      />
      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Student"}
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
