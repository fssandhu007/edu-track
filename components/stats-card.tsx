import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  color?: "blue" | "orange" | "green" | "purple"
}

export function StatsCard({ title, value, icon, trend, color = "blue" }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-chart-1/10 text-chart-1",
    orange: "bg-chart-2/10 text-chart-2",
    green: "bg-chart-3/10 text-chart-3",
    purple: "bg-chart-4/10 text-chart-4",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && <span className="text-xs font-medium text-chart-3">{trend}</span>}
      </div>
    </div>
  )
}
