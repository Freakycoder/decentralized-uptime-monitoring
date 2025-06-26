import * as React from "react"
import { cn } from "../../lib/utils"
import { AlertCircle, Check, X } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, leftIcon, rightIcon, label, helperText, ...props }, ref) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : '';
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-input px-3 py-2 text-sm transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              {
                "border-border focus:border-ring focus:ring-ring": !hasError && !success,
                "border-red-500 focus:border-red-500 focus:ring-red-500": hasError,
                "border-green-500 focus:border-green-500 focus:ring-green-500": success,
                "pl-10": leftIcon,
                "pr-10": rightIcon || hasError || success,
              },
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Status Icons */}
          {(rightIcon || hasError || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
              {success && !hasError && <Check className="h-4 w-4 text-green-500" />}
              {rightIcon && !hasError && !success && (
                <span className="text-muted-foreground">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Helper Text or Error Message */}
        {(helperText || errorMessage) && (
          <p className={cn(
            "mt-1.5 text-xs",
            hasError ? "text-red-500" : "text-muted-foreground"
          )}>
            {errorMessage || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Additional Input Variants

export const InputGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("flex rounded-lg overflow-hidden border border-border", className)}>
      {children}
    </div>
  );
};

export const InputGroupText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "px-3 py-2 bg-muted text-muted-foreground text-sm font-medium flex items-center",
      className
    )}>
      {children}
    </div>
  );
};

export { Input }