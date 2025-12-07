"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { StudentsTable } from "@/components/students/students-table"

export default function StudentsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Students</h1>
            <p className="text-muted-foreground">View and manage all registered students</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <StudentsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
