/**
 * Base API configuration and utility functions
 */

// API base URL - handle both server-side (Docker) and client-side (browser) environments
const getApiBaseUrl = () => {
  // If we're on the server-side (Docker), use the internal service name
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || "http://nginx/api"
  }
  // If we're on the client-side (browser), use the public URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost/api"
}

const API_BASE_URL = getApiBaseUrl()

// Debug log the API base URL
console.log('🔧 API Base URL:', API_BASE_URL)
console.log('🔧 Environment:', process.env.NODE_ENV)
console.log('🔧 Internal API URL:', process.env.INTERNAL_API_URL)
console.log('🔧 Public API URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('🔧 Is Server Side:', typeof window === 'undefined')

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
  console.log('🌐 Making API request to:', url)
  console.log('🌐 Request options:', { method: options.method, headers: options.headers })
  
  const controller = new AbortController()
  const { signal } = controller

  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    })

    clearTimeout(timeoutId)
    console.log('🌐 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: errorData
      })
      
      // Create a more descriptive error message
      const errorMessage = errorData.message || 
                          errorData.error || 
                          `HTTP ${response.status}: ${response.statusText}`
      
      throw new Error(errorMessage)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('🌐 Fetch error:', error)
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
  async get<T>(endpoint: string, params?: Record<string, string> | { responseType?: string }): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    
    // Handle responseType parameter
    let responseType = 'json'
    let queryParams: Record<string, string> = {}
    
    if (params) {
      if ('responseType' in params) {
        responseType = params.responseType || 'json'
        queryParams = { ...params }
        delete queryParams.responseType
      } else {
        queryParams = params
      }
    }

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetchWithTimeout(url.toString(), {
      method: "GET",
      headers: responseType === 'blob' ? {} : defaultHeaders,
      credentials: "include",
    })

    if (responseType === 'blob') {
      return response.blob() as T
    }
    
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

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  },
}

// Fetch store name from backend
export async function fetchStoreName() {
  const response = await apiClient.get<{ name: string }>("/v1/store")
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
