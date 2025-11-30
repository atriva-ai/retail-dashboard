import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function MainNav() {
  const pathname = usePathname()

  return (
    <ScrollArea className="flex items-center space-x-4 lg:space-x-6">
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
        asChild
      >
        <Link href="/">Dashboard</Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/cameras" ? "text-primary" : "text-muted-foreground"
        )}
        asChild
      >
        <Link href="/cameras">Cameras</Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/settings" ? "text-primary" : "text-muted-foreground"
        )}
        asChild
      >
        <Link href="/settings">Settings</Link>
      </Button>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  )
} 