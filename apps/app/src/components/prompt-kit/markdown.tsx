import * as React from "react";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { CodeBlock, CodeBlockCode } from "./code-block";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-(\w+)/);
  return match?.[1] ?? "plaintext";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (isInline) {
      return (
        <span
          className={cn(
            "rounded-sm bg-primary-foreground px-1 font-mono text-sm",
            className,
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    const language = extractLanguage(className);

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    );
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>;
  },
};

interface MarkdownBlockProps {
  content: string;
  components?: Partial<Components>;
}

function MarkdownBlock({
  content,
  components = INITIAL_COMPONENTS,
}: MarkdownBlockProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

MarkdownBlock.displayName = "MarkdownBlock";

export interface MarkdownProps {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
}

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = React.useId();
  const blockId = id ?? generatedId;
  const blocks = React.useMemo(
    () => parseMarkdownIntoBlocks(children),
    [children],
  );

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  );
}

MarkdownComponent.displayName = "Markdown";

export { MarkdownComponent as Markdown };
