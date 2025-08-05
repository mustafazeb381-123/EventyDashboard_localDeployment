import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "font-poppins file:text-foreground placeholder:text-muted-foreground h-[48px]  selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border border-gray-400 hover:border-black flex w-full min-w-0 rounded-[16px] bg-transparent px-3 text-base shadow-xs transition-[color,box-shadow,border] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-offset-background aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:brightness-110 active:transition-none",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
