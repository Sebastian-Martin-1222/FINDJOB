import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = "Se ha producido un error",
  message,
  onRetry,
  className,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-[#FFDAD6] bg-[#FFF5F5] p-4 text-[#93000A] shadow-sm",
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-[#BA1A1A] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#93000A]">{title}</h4>
          <p className="mt-1 text-sm text-[#93000A]/90">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-[#BA1A1A] bg-white px-3 py-1.5 text-xs font-semibold text-[#BA1A1A] shadow-sm hover:bg-[#FFDAD6]/40 focus:outline-none focus:ring-2 focus:ring-[#BA1A1A]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reintentar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
