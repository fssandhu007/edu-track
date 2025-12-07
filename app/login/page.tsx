"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BookOpen, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "student">("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password, role)
      router.push(role === "admin" ? "/admin" : "/student")
    } catch (err) {
      setError("Invalid credentials. Try admin@edutrack.com or student@edutrack.com")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg p-8 shadow-xl border border-border">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">EduTrack</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Welcome Back</h2>
          <p className="text-muted-foreground text-center mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <div className="flex gap-3">
                {(["admin", "student"] as const).map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={r}
                      checked={role === r}
                      onChange={(e) => setRole(e.target.value as "admin" | "student")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edutrack.com"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Demo credentials: admin@edutrack.com or student@edutrack.com (any password)
          </p>
        </div>
      </div>
    </div>
  )
}
