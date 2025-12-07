"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { StudentNav } from "@/components/student/student-nav"
import { studentApi } from "@/lib/api-client"
import { Mail, Phone, User, Edit2 } from "lucide-react"

interface StudentProfile {
  id: number
  full_name: string
  email: string
  phone: string
  bio: string
  profile_image_url: string
  enrollment_date: string
}

export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<StudentProfile>>({})

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // In a real app, you'd get this from auth context
        const data = await studentApi.getById(1)
        setStudent(data)
        setFormData(data)
      } catch (error) {
        console.error("Failed to fetch student:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updated = await studentApi.update(1, {
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
      })
      setStudent(updated)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  if (loading) {
    return (
      <div>
        <StudentNav />
        <div className="text-center py-12">Loading profile...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div>
        <StudentNav />
        <div className="text-center py-12">Profile not found</div>
      </div>
    )
  }

  return (
    <div>
      <StudentNav />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{student.full_name}</h2>
                  <p className="text-muted-foreground">
                    Student since {new Date(student.enrollment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">{student.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <User className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="text-foreground font-medium">{student.bio || "No bio added yet"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
