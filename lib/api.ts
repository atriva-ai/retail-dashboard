/**
 * Base API configuration and utility functions
 */

// API base URL - replace with your actual API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Debug log the API base URL
console.log('🔧 API Base URL:', API_BASE_URL)
console.log('🔧 Environment:', process.env.NODE_ENV)

// Default request headers
const defaultHeaders = {
  "Content-Type": "application/json",
}

// Request timeout in milliseconds
const TIMEOUT = 30000

/**
 * Custom fetch with timeout and error handling
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = TIMEOUT,
): Promise<Response> {
  const controller = new AbortController()
  const { signal } = controller

  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error:', errorData)
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timeout")
    }
    throw error
  }
}

/**
 * API client with common methods
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetchWithTimeout(url.toString(), {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    })

    return response.json()
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    })

    return response.json()
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetchWithTimeout(url, {
      method: "PUT",
      headers: defaultHeaders,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    })

    return response.json()
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetchWithTimeout(url, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    })

    return response.json()
  },
}

// Fetch store name from backend
export async function fetchStoreName() {
  const response = await apiClient.get<{ name: string }>("/api/v1/store")
  return response.name
}

/**
 * API error handling
 */
export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

/**
 * Authentication helper
 */
export const authApi = {
  async login(email: string, password: string) {
    return apiClient.post("/auth/login", { email, password })
  },

  async logout() {
    return apiClient.post("/auth/logout")
  },

  async getCurrentUser() {
    return apiClient.get("/auth/me")
  },
}
