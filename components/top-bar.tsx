"use client"

import { Bell, Settings, LogOut } from "lucide-react"

export function TopBar() {
  return (
    <header className="ml-64 border-b border-border bg-card sticky top-0 z-30">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        </div>

        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
