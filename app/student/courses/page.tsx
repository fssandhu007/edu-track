"use client"

import { useEffect, useState } from "react"
import { StudentNav } from "@/components/student/student-nav"
import { CourseCard } from "@/components/student/course-card"
import { courseApi } from "@/lib/api-client"
import { Search } from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  instructor_name: string
  category: string
  level: string
  duration_weeks: number
  enrolled_count: number
  max_capacity: number
  price: number
}

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseApi.getAll()
        setCourses(data)
        setFilteredCourses(data)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [searchTerm, selectedCategory, courses])

  const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category)))]

  return (
    <div>
      <StudentNav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Courses</h1>
          <p className="text-lg text-muted-foreground">Explore our wide range of courses</p>
        </div>

        <div className="mb-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
