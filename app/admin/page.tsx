"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { StatsCard } from "@/components/stats-card"
import { studentApi, courseApi, enrollmentApi } from "@/lib/api-client"
import { Users, BookOpen, Layers, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    enrollments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, courses, enrollments] = await Promise.all([
          studentApi.getAll(),
          courseApi.getAll(),
          enrollmentApi.getAll(),
        ])

        setStats({
          students: students.length,
          courses: courses.length,
          enrollments: enrollments.length,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to EduTrack</h1>
            <p className="text-muted-foreground">Manage your online learning platform</p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading dashboard...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Students"
                value={stats.students}
                icon={<Users className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Total Courses"
                value={stats.courses}
                icon={<BookOpen className="w-6 h-6" />}
                color="orange"
              />
              <StatsCard
                title="Active Enrollments"
                value={stats.enrollments}
                icon={<Layers className="w-6 h-6" />}
                color="green"
              />
              <StatsCard title="Growth" value="+12%" icon={<TrendingUp className="w-6 h-6" />} color="purple" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Overview</h3>
              <p className="text-muted-foreground">
                Welcome to your EduTrack administration dashboard. From here you can manage students, courses, and
                enrollments. Use the sidebar navigation to access each section.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Add your first course</li>
                <li>✓ Register students</li>
                <li>✓ Create enrollments</li>
                <li>✓ Monitor progress</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
