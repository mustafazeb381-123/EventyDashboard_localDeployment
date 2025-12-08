import { cn } from "@/lib/utils";
import "./skeleton.css";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-loader bg-gray-200 rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
