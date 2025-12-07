"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Users, Layers, BarChart3 } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: BarChart3,
    },
    {
      label: "Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "Courses",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Enrollments",
      href: "/admin/enrollments",
      icon: Layers,
    },
  ]

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">EduTrack</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
