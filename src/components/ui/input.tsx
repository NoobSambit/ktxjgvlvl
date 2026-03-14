import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)

Input.displayName = "Input"
