/**
 * Base API configuration and utility functions
 */

// API base URL - replace with your actual API endpoint
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"

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
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    })

    return response.json()
  },
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
