import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const baseClasses = "bg-white rounded-lg transition-all duration-300";
    
    const variants = {
      default: "shadow-md border-t-4 border-[#A72036]",
      elevated: "shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1",
      outlined: "border-2 border-gray-200"
    };

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
