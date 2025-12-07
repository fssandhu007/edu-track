"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, User, LogOut } from "lucide-react"

export function StudentNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Browse Courses",
      href: "/student/courses",
      icon: BookOpen,
    },
    {
      label: "My Profile",
      href: "/student/profile",
      icon: User,
    },
  ]

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/student" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">EduTrack</h1>
        </Link>

        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <LogOut className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </nav>
  )
}
