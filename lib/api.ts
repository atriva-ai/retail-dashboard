/**
 * Base API configuration and utility functions
 */

// API base URL - simplified since all calls are client-side
const getApiBaseUrl = () => {
  // In browser, detect the current host to work when accessed from network IPs
  if (typeof window !== 'undefined') {
    // Use relative URL if NEXT_PUBLIC_API_URL is not set or is localhost
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (!envUrl || envUrl === 'http://localhost' || envUrl.startsWith('http://localhost')) {
      // Use relative URL - will automatically use the same host/port as the frontend
      return ''
    }
    return envUrl
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost"
}

const API_BASE_URL = getApiBaseUrl()

// Debug log the API base URL (only in client-side context)
if (typeof window !== 'undefined') {
  console.log('🔧 API Base URL:', API_BASE_URL)
  console.log('🔧 Environment:', process.env.NODE_ENV)
  console.log('🔧 Public API URL:', process.env.NEXT_PUBLIC_API_URL)
  console.log('🔧 Is Server Side:', typeof window === 'undefined')
}

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
  // Only log in client-side context
  if (typeof window !== 'undefined') {
    console.log('🌐 Making API request to:', url)
    console.log('🌐 Request options:', { method: options.method, headers: options.headers })
  }
  
  const controller = new AbortController()
  const { signal } = controller

  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    })

    clearTimeout(timeoutId)
    
    // Only log in client-side context
    if (typeof window !== 'undefined') {
      console.log('🌐 Response status:', response.status, response.statusText)
    }

    if (!response.ok) {
      let errorData = {}
      let errorText = ''
      try {
        errorText = await response.text()
        errorData = errorText ? JSON.parse(errorText) : {}
      } catch {
        // If parsing fails, use empty object
        errorData = {}
      }
      
      // Only log errors in client-side context
      if (typeof window !== 'undefined') {
        try {
          const errorInfo = {
            status: response.status,
            statusText: response.statusText,
            url: (response as any).url || url,
            data: errorData,
            rawText: errorText || '(empty response)'
          }
          console.error('API Error Response:', errorInfo)
        } catch (logError) {
          // Silently fail if logging causes issues
        }
      }
      
      // Create a more descriptive error message
      const errorMessage = (errorData as any)?.message || 
                          (errorData as any)?.error || 
                          (errorData as any)?.detail ||
                          (errorText && errorText.trim() ? errorText : `HTTP ${response.status}: ${response.statusText}`)
      
      throw new Error(errorMessage)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    // Only log errors in client-side context
    if (typeof window !== 'undefined') {
      console.error('🌐 Fetch error:', error)
    }
    
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
    // Handle relative URLs (when API_BASE_URL is empty string)
    const baseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    const url = new URL(endpoint, baseUrl)
    
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
    const baseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    const url = `${baseUrl}${endpoint}`

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
    const baseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    const url = `${baseUrl}${endpoint}`

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
    const baseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    const url = `${baseUrl}${endpoint}`

    const response = await fetchWithTimeout(url, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    })

    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204) {
      return {} as T
    }
    
    // Handle 200 OK with potentially empty body
    if (response.status === 200) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text()
          return text ? JSON.parse(text) : ({} as T)
        } catch {
          return {} as T
        }
      }
      return {} as T
    }

    // For other status codes, try to parse JSON
    try {
      return await response.json()
    } catch {
      // If JSON parsing fails, return empty object
      return {} as T
    }
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
