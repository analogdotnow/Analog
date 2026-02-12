import { cn } from "@/lib/utils";

type AugmentedItemProps = React.ComponentProps<"div">;

export function AugmentedItem({
  className,
  children,
  ...props
}: AugmentedItemProps) {
  return (
    <div
      className={cn(
        "inline-flex min-h-4 w-4 flex-col items-center justify-start gap-2 rounded-full border border-(--item-color)/40 bg-(--item-stripe-color)/0 p-px transition-all duration-100 *:relative *:z-10 before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:opacity-20 before:transition-all before:duration-100 before:content-[''] before:bg-stripe hover:border-(--item-color) hover:bg-(--item-stripe-color) hover:before:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type AugmentedItemHeaderProps = React.ComponentProps<"div">;

export function AugmentedItemHeader({
  className,
  children,
  ...props
}: AugmentedItemHeaderProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

type AugmentedItemTitleProps = React.ComponentProps<"span">;

export function AugmentedItemTitle({
  className,
  children,
  ...props
}: AugmentedItemTitleProps) {
  return (
    <span className={cn("sr-only", className)} {...props}>
      {children}
    </span>
  );
}

type AugmentedItemContentProps = React.ComponentProps<"div">;

export function AugmentedItemContent({
  className,
  children,
  ...props
}: AugmentedItemContentProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}
