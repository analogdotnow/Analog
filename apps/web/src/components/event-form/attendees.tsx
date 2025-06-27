import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface AttendeesListItemProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  name?: string;
  email: string;
  status: "accepted" | "declined" | "tentative" | "unknown";
  type?: "required" | "optional" | "resource";
}

export function AttendeesListItem({
  className,
  name,
  email,
  status,
  type,
  ...props
}: AttendeesListItemProps) {
  const ref = useAutoResizeTextarea(120);

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Avatar>
        {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
        <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}


