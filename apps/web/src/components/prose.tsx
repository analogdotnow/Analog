import type React from "react";

import { cn } from "@/lib/utils";

interface ProseProps extends React.HTMLAttributes<HTMLElement> {
  as?: "article";
  html: string;
};

export function Prose({ children, html, className }: ProseProps) {
  return (
    <article
      className={cn(
        "mx-auto prose max-w-none dark:prose-invert prose-h1:text-xl prose-h2:font-semibold prose-p:text-justify prose-a:text-blue-600",
        className,
      )}
    >
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
    </article>
  );
}
