// hooks/use-store-name.ts

import { useApi } from "./use-api"
import { fetchStoreName } from "@/lib/api"

export function useStoreName() {
  return useApi(fetchStoreName, true) // true means it fetches immediately
}
