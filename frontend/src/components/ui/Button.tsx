import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg select-none";

    const variantStyles = {
      primary:
        "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] focus-visible:ring-[#1D4ED8] shadow-sm",
      secondary:
        "bg-[#059669] text-white hover:bg-[#047857] focus-visible:ring-[#059669] shadow-sm",
      danger:
        "bg-[#BA1A1A] text-white hover:bg-[#93000A] focus-visible:ring-[#BA1A1A] shadow-sm",
      outline:
        "border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F2F3FF] focus-visible:ring-[#1D4ED8]",
      ghost:
        "bg-transparent text-[#0F172A] hover:bg-[#F2F3FF] focus-visible:ring-[#1D4ED8]",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
