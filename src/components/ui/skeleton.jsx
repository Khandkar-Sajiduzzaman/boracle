import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="skeleton"
      className={cn(
        "bg-neutral-900/10 animate-pulse rounded-md dark:bg-neutral-50/10",
        className
      )}
      {...props} />)
  );
}

export { Skeleton }
