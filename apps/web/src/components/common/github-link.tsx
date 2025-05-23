import { GitHub } from "@/components/icons/github";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GitHubLinkProps {
  className?: string;
}

export function GitHubLink({ className }: GitHubLinkProps) {
  return (
    <a
      href="https://github.com/JeanMeijer/analog"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "h-9 w-9 p-0",
        className
      )}
    >
      <GitHub />
      <span className="sr-only">GitHub</span>
    </a>
  );
}
