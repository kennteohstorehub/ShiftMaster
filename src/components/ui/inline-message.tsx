import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const inlineMessageVariants = cva(
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        success: "bg-green-50 text-green-700 border border-green-200",
        error: "bg-red-50 text-red-700 border border-red-200",
        warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        info: "bg-blue-50 text-blue-700 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InlineMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineMessageVariants> {
  message: string
  onClose?: () => void
}

const iconMap = {
  default: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

export function InlineMessage({
  className,
  variant,
  message,
  onClose,
  ...props
}: InlineMessageProps) {
  const Icon = iconMap[variant || "default"]
  
  return (
    <div
      className={cn(inlineMessageVariants({ variant }), className)}
      {...props}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
          aria-label="Close message"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}