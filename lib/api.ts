/**
 * Base API configuration and utility functions
 */

// API base URL - simplified since all calls are client-side
const getApiBaseUrl = () => {
  // In browser, detect the current host to work when accessed from network IPs
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    
    // If explicitly set to a full URL (not just 'http://localhost'), use it
    if (envUrl && envUrl !== 'http://localhost' && envUrl.includes('://')) {
      return envUrl
    }
    
    // Get current host and protocol
    const currentHost = window.location.hostname
    const currentProtocol = window.location.protocol
    const currentPort = window.location.port
    
    // Always use the current host for API calls - this handles:
    // - localhost:3000 -> localhost:8000
    // - 192.168.9.185:3000 -> 192.168.9.185:8000
    // - Any network IP -> same IP with port 8000
    
    // In development, if running directly (not through nginx), use backend port 8000
    // Check if we're accessing via nginx (port 80/443) or directly (port 3000)
    if (currentPort === '3000' || currentPort === '' || currentPort === '80' || currentPort === '443') {
      // If port is 80/443, we're likely going through nginx - use relative URL
      if (currentPort === '80' || currentPort === '443' || currentPort === '') {
        return ''
      }
      // Running directly in dev mode - use same host but backend port 8000
      // This handles both localhost and network IPs (e.g., 192.168.9.185)
      return `${currentProtocol}//${currentHost}:8000`
    }
    
    // Running through nginx or production - use relative URL (nginx will proxy /api to backend)
    return ''
  }
  // Server-side: use environment variable or default to backend port
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
}

const API_BASE_URL = getApiBaseUrl()

// Debug log the API base URL (only in client-side context)
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    apiBaseUrl: API_BASE_URL,
    currentHost: window.location.hostname,
    currentPort: window.location.port,
    currentProtocol: window.location.protocol,
    envApiUrl: process.env.NEXT_PUBLIC_API_URL,
    nodeEnv: process.env.NODE_ENV
  })
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
      let errorData: any = {}
      let errorText = ''
      try {
        errorText = await response.text()
        if (errorText && errorText.trim()) {
          try {
            errorData = JSON.parse(errorText)
          } catch {
            // If JSON parsing fails, use the raw text as error data
            errorData = { raw: errorText }
          }
        }
      } catch (textError) {
        // If reading text fails, errorData remains empty
        errorText = ''
      }
      
      // Only log errors in client-side context
      if (typeof window !== 'undefined') {
        try {
          // Safely serialize error info to avoid circular references or non-serializable values
          const errorInfo: Record<string, any> = {}
          
          if (response && typeof response.status === 'number') {
            errorInfo.status = response.status
          }
          if (response && typeof response.statusText === 'string') {
            errorInfo.statusText = response.statusText
          }
          if (typeof url === 'string') {
            errorInfo.url = url
          }
          if (options && typeof options.method === 'string') {
            errorInfo.method = options.method
          } else {
            errorInfo.method = 'GET'
          }
          if (errorData && typeof errorData === 'object') {
            try {
              errorInfo.hasErrorData = Object.keys(errorData).length > 0
              // Only include errorData if it's serializable
              try {
                JSON.stringify(errorData)
                errorInfo.errorData = errorData
              } catch {
                errorInfo.errorData = '[non-serializable]'
              }
            } catch {
              errorInfo.hasErrorData = false
            }
          }
          if (typeof errorText === 'string') {
            errorInfo.rawText = errorText || '(empty response body)'
          } else {
            errorInfo.rawText = '(empty response body)'
          }
          
          console.error('API Error Response:', errorInfo)
        } catch (logError) {
          // If logging fails, at least log the basic info using separate console.error calls
          try {
            console.error('API Error - Status:', response?.status)
            console.error('API Error - StatusText:', response?.statusText)
            console.error('API Error - URL:', url)
          } catch {
            // Last resort - just log a simple message
            console.error('API Error occurred but could not log details')
          }
        }
      }
      
      // Create a more descriptive error message
      const errorMessage = errorData?.message || 
                          errorData?.error || 
                          errorData?.detail ||
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
