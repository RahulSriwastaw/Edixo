import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[20px] border px-[9px] py-[3px] text-[11px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-[var(--bg-card)] text-[var(--text-secondary)] [a&]:hover:bg-[var(--bg-sidebar)]",
        destructive:
          "border-transparent bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] [a&]:hover:brightness-115 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-[var(--btn-secondary-border)] text-[var(--text-primary)] [a&]:hover:bg-[var(--bg-card)]",
        success:
          "border-transparent bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]",
        info:
          "border-transparent bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]",
        warning:
          "border-transparent bg-[#FFF8E1] text-[#F57F17] dark:bg-[#3A3A1A] dark:text-[#FFC107]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
