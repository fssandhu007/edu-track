"use client"

import Link from "next/link"
import { BookOpen, Users, Award, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">EduTrack</h1>
          </div>

          <div className="flex gap-4">
            <Link href="/admin" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
              Admin Portal
            </Link>
            <Link href="/student" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">Welcome to EduTrack</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive learning management system designed for seamless online education. Manage students, courses,
            and enrollments all in one place.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium"
            >
              Go to Admin
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/student"
              className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 font-medium"
            >
              Go to Student Portal
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Student Management</h3>
            <p className="text-muted-foreground">
              Easily manage student registrations, profiles, and track their learning progress.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-chart-1" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Course Management</h3>
            <p className="text-muted-foreground">
              Create and manage courses with capacity limits, pricing, and detailed information.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-chart-3" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Enrollment Tracking</h3>
            <p className="text-muted-foreground">
              Monitor enrollments, track progress, and issue certificates for completed courses.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
