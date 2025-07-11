"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api"

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

interface ApiHook<T, P = void> {
  data: T | null
  isLoading: boolean
  error: Error | null
  execute: (params?: P) => Promise<T | null>
  reset: () => void
}

/**
 * Generic hook for API calls
 */
export function useApi<T, P = void>(
  apiMethod: (params: P) => Promise<T>,
  immediate = false,
  initialParams?: P,
): ApiHook<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  })

  const isMounted = useRef(true)

  useEffect(() => {
    console.log('[useApi] mounted, immediate:', immediate, 'initialParams:', initialParams)
    return () => {
      isMounted.current = false
      console.log('[useApi] unmounted')
    }
  }, [])

  const execute = useCallback(
    async (params?: P): Promise<T | null> => {
      if (!isMounted.current) return null
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      console.log('[useApi] execute called, params:', params)
      try {
        const data = await apiMethod(params as P)
        console.log('✅ API call successful:', data);
        if (isMounted.current) {
          setState({ data, isLoading: false, error: null })
        }
        return data
      } catch (error) {
        const apiError = error instanceof Error ? error : new Error("Unknown error occurred")
        console.error('❌ API call failed:', apiError);
        if (isMounted.current) {
          setState({ data: null, isLoading: false, error: apiError })
        }
        return null
      }
    },
    [apiMethod],
  )

  const reset = useCallback(() => {
    if (isMounted.current) {
      setState({ data: null, isLoading: false, error: null })
    }
  }, [])

  /* guarding immediate with a ref so it doesn't re-trigger every time execute changes */
  /*
  useEffect(() => {
    if (immediate) {
      execute(initialParams as P)
    }
  }, [immediate, initialParams, execute])
  */
  useEffect(() => {
    if (immediate) {
      console.log('[useApi] immediate effect running, calling execute with:', initialParams)
      execute(initialParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return {
    ...state,
    execute,
    reset,
  }
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(endpoint: string, pageSize = 10) {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPage = useCallback(
    async (pageNum: number) => {
      try {
        const response = await apiClient.get<{
          data: T[]
          meta: { total: number; page: number; pageSize: number; totalPages: number }
        }>(endpoint, {
          page: pageNum.toString(),
          pageSize: pageSize.toString(),
        })

        setTotalPages(response.meta.totalPages)
        return response.data
      } catch (error) {
        throw error
      }
    },
    [endpoint, pageSize],
  )

  // causing maximum update depth exceeded error
  //const { data, isLoading, error, execute } = useApi<T[]>(() => fetchPage(page), true)
  const fetchCurrentPage = useCallback(() => fetchPage(page), [fetchPage, page])
  const { data, isLoading, error, execute } = useApi<T[]>(fetchCurrentPage, true)

  const goToPage = useCallback(
    (pageNum: number) => {
      setPage(pageNum)
      execute()
    },
    [execute],
  )

  return {
    data,
    isLoading,
    error,
    page,
    totalPages,
    goToPage,
    refresh: execute,
  }
}
