"use client"
import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useSettings } from "@/hooks/use-settings"

export default function Header() {
  const [now, setNow] = useState("");
  const { settings, refreshSettings } = useSettings();

  useEffect(() => {
    setNow(format(new Date(), "yyyy-MM-dd"));
  }, []);

  // Refresh settings when component mounts
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            Retail AI Analytics Dashboard - {settings?.store_name || "Loading..."}
          </h1>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{now}</div>
    </header>
  )
}