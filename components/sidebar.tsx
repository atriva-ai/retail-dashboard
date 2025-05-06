"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Home,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./sidebar-provider"
import { Badge } from "./ui/badge"
import { useStoreName } from "@/hooks/use-store-name"
// edited for adding store name input
import { useApi } from "@/hooks/use-api"
import { apiClient } from "@/lib/api" // where API call wrappers go
import { Input } from "@/components/ui/input"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    badge: "3",
  },
  {
    title: "Live Cameras",
    href: "/cameras",
    icon: Camera,
    badge: "16",
  },
  {
    title: "Product Analytics",
    href: "/product-analytics",
    icon: ShoppingBag,
  },
  {
    title: "Person Activity",
    href: "/person-activity",
    icon: Users,
  },
  {
    title: "Staff Monitoring",
    href: "/staff-monitoring",
    icon: CircleUser,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

// -- get and post functions for store name
async function fetchStore() {
  const response = await apiClient.get<{ name: string }>("/api/store")
  return response
}

async function updateStoreName(data: { name: string }) {
  const response = await apiClient.post<{ name: string }>("/api/store", data)
  return response
}

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggleSidebar } = useSidebar()

  // adding loading and saving store name
  const { data, isLoading, execute: loadStore } = useApi(fetchStore, true)
  const { execute: saveStore } = useApi(updateStoreName)

  const [editing, setEditing] = useState(false)
  const [storeName, setStoreName] = useState("")

  useEffect(() => {
    if (data?.name) {
      setStoreName(data.name)
    }
  }, [data])

  const handleSave = async () => {
    const result = await saveStore({ name: storeName })
    if (result) {
      setEditing(false)
    }
  }

  return (
    <div
      className={cn("h-screen bg-background border-r transition-all duration-300 relative", isOpen ? "w-64" : "w-16")}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h1
          className={cn(
            "font-bold text-xl transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0 hidden",
          )}
        >
          Dashboard {storeName ? `- ${storeName}` : ""}
        </h1>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className={cn("flex-1", !isOpen && "hidden")}>{item.title}</span>
              {item.badge && isOpen && (
                <Badge variant="outline" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className={cn("flex items-center space-x-2", !isOpen && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className={cn("space-y-1", !isOpen && "hidden")}>
            <p className="text-sm font-medium">Analytics Pro</p>
            {editing ? (
              <>
                <Input
                  className="text-xs"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{storeName || "Loading..."}</p>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
