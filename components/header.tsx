"use client"

import { BarChart3 } from "lucide-react"
import { format } from "date-fns"

export default function Header() {
  const today = new Date()
  const formattedDate = format(today, "EEEE, MMMM d, yyyy")

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold">Retail AI Analytics Dashboard</h1>
      </div>
      <div className="text-sm text-muted-foreground">{formattedDate}</div>
    </header>
  )
}
