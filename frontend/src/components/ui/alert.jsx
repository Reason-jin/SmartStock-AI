import * as React from "react";
import { cn } from "../../lib/utils"; // 만약 utils가 없다면 아래 참고

export function Alert({ className, children, ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <div
      className={cn("text-sm text-gray-700 mt-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}
