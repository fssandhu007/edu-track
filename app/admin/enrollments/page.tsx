"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { EnrollmentsTable } from "@/components/enrollments/enrollments-table"

export default function EnrollmentsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Enrollments</h1>
            <p className="text-muted-foreground">Track and manage student enrollments</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <EnrollmentsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
