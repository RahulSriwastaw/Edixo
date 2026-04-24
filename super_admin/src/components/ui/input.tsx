import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--text-primary)] placeholder:text-[var(--text-muted)] selection:bg-primary selection:text-primary-foreground bg-[var(--bg-input)] border-[var(--border-input)] flex h-8 w-full min-w-0 rounded-[6px] border px-3 py-1 text-[13px] shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[13px] file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[#FF6B2B] focus-visible:ring-[#FF6B2B]/15 focus-visible:ring-[2px]",
        "aria-invalid:ring-[var(--badge-error-text)]/20 aria-invalid:border-[var(--badge-error-text)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
