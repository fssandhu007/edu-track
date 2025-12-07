"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: number
  email: string
  full_name: string
  role: "admin" | "student"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role: "admin" | "student") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("edutrack_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, role: "admin" | "student") => {
    // In a real app, this would authenticate against your backend
    // For now, we'll use mock authentication
    const mockUsers: Record<string, User> = {
      "admin@edutrack.com": {
        id: 1,
        email: "admin@edutrack.com",
        full_name: "Admin User",
        role: "admin",
      },
      "student@edutrack.com": {
        id: 1,
        email: "student@edutrack.com",
        full_name: "John Doe",
        role: "student",
      },
    }

    const user = mockUsers[email]
    if (user && user.role === role) {
      setUser(user)
      localStorage.setItem("edutrack_user", JSON.stringify(user))
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("edutrack_user")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
