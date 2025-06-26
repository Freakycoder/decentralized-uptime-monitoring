import * as React from "react"
import { cn } from "../../lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border",
      bordered: "bg-card border-2 border-border",
      elevated: "bg-card shadow-lg border border-border/50",
      glass: "bg-card/80 backdrop-blur-sm border border-white/10"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Additional Card Components for Professional Design

const CardStat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    description?: string
    icon?: React.ReactNode
    trend?: { value: number; isPositive: boolean }
  }
>(({ className, title, value, description, icon, trend, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 rounded-lg bg-muted/50", className)}
    {...props}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {icon && (
        <div className="p-2 rounded-md bg-background">
          {icon}
        </div>
      )}
    </div>
  </div>
))
CardStat.displayName = "CardStat"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardStat }