"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { CoursesTable } from "@/components/courses/courses-table"

export default function CoursesPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Courses</h1>
            <p className="text-muted-foreground">Create and manage your courses</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <CoursesTable />
          </div>
        </main>
      </div>
    </div>
  )
}
