"use client"

import { StudentNav } from "@/components/student/student-nav"
import { MyEnrollments } from "@/components/student/my-enrollments"
import { BookOpen, Award, TrendingUp } from "lucide-react"

export default function StudentDashboard() {
  return (
    <div>
      <StudentNav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, Student!</h1>
          <p className="text-lg text-muted-foreground">Continue your learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Courses Enrolled</h3>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">3</p>
          </div>

          <div className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Completed</h3>
              <Award className="w-5 h-5 text-chart-3" />
            </div>
            <p className="text-3xl font-bold text-foreground">1</p>
          </div>

          <div className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">In Progress</h3>
              <TrendingUp className="w-5 h-5 text-chart-1" />
            </div>
            <p className="text-3xl font-bold text-foreground">2</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">My Courses</h2>
          <MyEnrollments />
        </div>
      </main>
    </div>
  )
}
