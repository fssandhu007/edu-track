export async function apiCall(endpoint: string, method = "GET", body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`/api${endpoint}`, options)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "API request failed")
  }

  return response.json()
}

export const studentApi = {
  getAll: () => apiCall("/students"),
  getById: (id: number) => apiCall(`/students/${id}`),
  create: (data: any) => apiCall("/students", "POST", data),
  update: (id: number, data: any) => apiCall(`/students/${id}`, "PUT", data),
  delete: (id: number) => apiCall(`/students/${id}`, "DELETE"),
}

export const courseApi = {
  getAll: () => apiCall("/courses"),
  getById: (id: number) => apiCall(`/courses/${id}`),
  create: (data: any) => apiCall("/courses", "POST", data),
  update: (id: number, data: any) => apiCall(`/courses/${id}`, "PUT", data),
  delete: (id: number) => apiCall(`/courses/${id}`, "DELETE"),
}

export const enrollmentApi = {
  getAll: () => apiCall("/enrollments"),
  create: (data: any) => apiCall("/enrollments", "POST", data),
  update: (id: number, data: any) => apiCall(`/enrollments/${id}`, "PUT", data),
  delete: (id: number) => apiCall(`/enrollments/${id}`, "DELETE"),
}
