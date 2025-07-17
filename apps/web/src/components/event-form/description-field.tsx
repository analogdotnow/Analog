import * as React from "react";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  EditorContent,
  JSONContent,
  generateText,
  useEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import * as linkifyjs from "linkifyjs";

import { ExitLinkOnSpace } from "@/lib/tiptap/extensions";
import { cn } from "@/lib/utils";

// Create a separate extension to handle exiting links on space

// Parser function to convert plain text with URLs to Tiptap content
function parseTextWithLinks(text: string): JSONContent | string {
  if (!text) {
    return "";
  }

  const links = linkifyjs.find(text);

  if (links.length === 0) {
    // No links found, return simple paragraph with original text
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: text,
            },
          ],
        },
      ],
    };
  }

  // Build content with links, preserving original text structure
  const content: JSONContent[] = [];
  let lastIndex = 0;

  links.forEach((link) => {
    // Add text before link
    if (link.start > lastIndex) {
      const textBefore = text.slice(lastIndex, link.start);
      if (textBefore) {
        content.push({
          type: "text",
          text: textBefore,
        });
      }
    }

    // Add link
    content.push({
      type: "text",
      text: link.value,
      marks: [
        {
          type: "link",
          attrs: {
            href: link.href,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      ],
    });

    lastIndex = link.end;
  });

  // Add remaining text after last link
  if (lastIndex < text.length) {
    const textAfter = text.slice(lastIndex);
    if (textAfter) {
      content.push({
        type: "text",
        text: textAfter,
      });
    }
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content,
      },
    ],
  };
}

interface DescriptionFieldProps {
  id?: string;
  name?: string;
  className?: string;
  value: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const extensions = [
  StarterKit.configure({
    // Disable all formatting except for basic text
    bold: false,
    italic: false,
    strike: false,
    code: false,
    codeBlock: false,
    heading: false,
    blockquote: false,
    horizontalRule: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    // Keep only basic text functionality (these are enabled by default)
    paragraph: {},
    hardBreak: {},
    history: {},
  }),
  Link.configure({
    openOnClick: true,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      class:
        "text-link underline hover:text-link transition-colors cursor-pointer",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }),
  ExitLinkOnSpace,
];

export function DescriptionField({
  className,
  value,
  onChange,
  onBlur,
  placeholder = "Description",
  ...props
}: DescriptionFieldProps) {
  const [parsedValue, setParsedValue] = React.useState<JSONContent | string>(
    "",
  );

  const editor = useEditor({
    extensions: [
      ...extensions,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:ps-6 cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-1.25 before:left-2 before:text-sm before:opacity-50 before-pointer-events-none",
      }),
    ],
    content: parseTextWithLinks(value),
    onBlur: ({ editor }) => {
      const text = editor.getText();

      const parsedText =
        typeof parsedValue === "string"
          ? parsedValue
          : generateText(parsedValue, extensions);

      console.log(parsedText === text, parsedText, text);
      if (parsedText === text) {
        return;
      }

      onChange?.(text);
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: cn(
          "scrollbar-hidden overflow-y-auto text-sm field-sizing-content max-h-64 h-full min-h-0 resize-none border-none bg-transparent py-1.25 ps-8 font-medium shadow-none dark:bg-transparent focus:outline-none",
          "prose prose-sm max-w-none [&_p]:m-0 [&_p]:leading-normal",
          className,
        ),
      },
    },
  });

  // Ensure we show a placeholder before the editor is mounted.
  const [showPlaceholder, setShowPlaceholder] = React.useState(true);

  React.useEffect(() => {
    setShowPlaceholder(false);

    const content = parseTextWithLinks(value);

    setParsedValue(content);

    editor?.commands.setContent(content, false, {
      preserveWhitespace: true,
    });
  }, [editor, value]);

  return (
    <div className="relative min-h-8">
      {showPlaceholder ? (
        <div className="pointer-events-none absolute top-1.25 left-8 text-sm opacity-50">
          <p className="text-sm font-medium">{placeholder}</p>
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
