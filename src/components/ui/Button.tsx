import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer border-none rounded-md";
    
    const variants = {
      primary: "bg-[#A72036] text-white hover:bg-[#8a1a2c] hover:transform hover:-translate-y-0.5 hover:shadow-lg",
      secondary: "bg-gray-100 text-[#303038] hover:bg-gray-200",
      danger: "bg-red-600 text-white hover:bg-red-700",
      success: "bg-green-600 text-white hover:bg-green-700"
    };
    
    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-5 py-3 text-base",
      lg: "px-6 py-4 text-lg"
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
