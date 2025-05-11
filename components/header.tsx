import { BarChart3 } from "lucide-react";
import { format } from "date-fns";

export default async function Header() {
  // Server-side date formatting
  const today = new Date()
  const formattedDate = format(today, "yyyy-MM-dd") // Deterministic format, safe for hydration

  // Fetch store name from backend API
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000"
  let storeName = "Unknown Store"

  try {
    const res = await fetch(`${baseUrl}/api/store`, {
      cache: "force-cache", // You can adjust to 'force-cache' or 'default' if needed
    })

    if (res.ok) {
      const data = await res.json()
      storeName = data.name || storeName
    } else {
      console.error("Failed to fetch store name:", res.statusText)
    }
  } catch (error) {
    console.error("❌ Error fetching store name:", error)
  }

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            Retail AI Analytics Dashboard - {storeName}
          </h1>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{formattedDate}</div>
    </header>
  )
}
