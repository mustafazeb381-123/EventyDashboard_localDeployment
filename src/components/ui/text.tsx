import * as React from "react";
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string; // Tailwind color class, e.g. "text-gray-700"
  as?: React.ElementType;
}

const sizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Text({
  size = "base",
  weight = "normal",
  color = "text-gray-900",
  as: Comp = "p",
  className,
  ...props
}: TextProps) {
  return (
    <Comp
      className={cn(
        "font-poppins",
        sizeMap[size],
        weightMap[weight],
        color,
        className
      )}
      {...props}
    />
  );
}
