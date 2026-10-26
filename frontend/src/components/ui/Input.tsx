import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#0F172A] shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[#BA1A1A] focus-visible:ring-[#BA1A1A]"
              : "border-[#CBD5E1] focus-visible:ring-[#1D4ED8]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-[#BA1A1A]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#434655]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
