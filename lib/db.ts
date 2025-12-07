import { sql } from "@vercel/postgres"

// Using @vercel/postgres for secure connection pooling

export async function query(text: string, params?: any[]) {
  try {
    const result = await sql.query(text, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export const db = {
  query,
}
