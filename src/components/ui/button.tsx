import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive tap-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-pink-600 text-primary-foreground shadow-ios hover:shadow-ios-lg hover:from-primary hover:to-pink-500 active:scale-95 relative overflow-hidden",
        destructive:
          "bg-destructive text-white shadow-ios hover:shadow-ios-lg hover:bg-destructive/90 active:scale-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-input bg-background shadow-ios hover:shadow-ios-lg hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-ios hover:shadow-ios-lg hover:bg-secondary/80 active:scale-95",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "glass text-foreground shadow-ios hover:shadow-ios-lg hover:backdrop-blur-md active:scale-95",
        gradient:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-ios hover:shadow-glow-pink active:scale-95 font-semibold",
        premium:
          "bg-gradient-to-br from-premium-pink to-premium-purple text-white shadow-ios-lg hover:shadow-glow-pink hover:from-premium-pink hover:to-premium-purple active:scale-95 relative overflow-hidden group",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-3 rounded-lg",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-5 text-base font-semibold",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
