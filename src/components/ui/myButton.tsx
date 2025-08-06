import * as React from "react";
import { cn } from "@/lib/utils";

// Reusable button class
export const myButtonClass =
  "font-poppins inline-flex items-center justify-center w-full whitespace-nowrap text-sm transition-all duration-300 ease-in-out rounded-full cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-102 hover:shadow-md hover:shadow-[#1A1F58]/25 hover:brightness-110 active:scale-[0.98] active:transition-none";

// Variant classes
export const myButtonVariants = {
  default: "bg-gradient-to-l from-[#0F4999] to-[#1A1F58] text-white border-0",
  outline:
    "bg-transparent border-2 border-[#0F4999] text-[#0F4999] hover:bg-gradient-to-l hover:from-[#0F4999] hover:to-[#1A1F58] hover:text-white relative before:absolute before:inset-0 before:rounded-full before:p-[2px] before:bg-gradient-to-l before:from-[#0F4999] before:to-[#1A1F58] before:-z-10",
};

export interface MyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const MyButton = React.forwardRef<HTMLButtonElement, MyButtonProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref
  ) => {
    const baseClasses =
      "font-poppins inline-flex items-center justify-center w-full whitespace-nowrap text-sm transition-all duration-300 ease-in-out rounded-full border-0 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-102 hover:shadow-md hover:shadow-[#1A1F58]/25 hover:brightness-110 active:scale-[0.98] active:transition-none";

    const variantClasses = {
      default:
        "bg-gradient-to-l from-[#0F4999] to-[#1A1F58] text-white border-0",
      outline:
        "bg-transparent border-2 border-[#0F4999] text-[#0F4999] hover:bg-gradient-to-l hover:from-[#0F4999] hover:to-[#1A1F58] hover:text-white",
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}>
        {children}
      </button>
    );
  }
);
MyButton.displayName = "MyButton";

export { MyButton };
