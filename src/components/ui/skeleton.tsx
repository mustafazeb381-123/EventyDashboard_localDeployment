import { cn } from "@/lib/utils";
import "./skeleton.css";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-loader rounded-md bg-gray-200 dark:bg-slate-800",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
