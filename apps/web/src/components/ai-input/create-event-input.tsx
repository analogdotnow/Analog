"use client";

import * as React from "react";
import Document from "@tiptap/extension-document";
import Mention from "@tiptap/extension-mention";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorView } from "@tiptap/pm/view";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { createEventInputSuggestions } from "./create-event-input-suggestions";

interface Mention {
  type: "mention";
  attrs: {
    id: "mention-date" | "mention-time" | "mention-duration";
    label: string; // the value, might be a date, time, or duration
  };
}

// based on the title and mentions, create a description
// like this:
// "Sales meeting at 22:00 on May 1st 2025"
// if shorter than a week we can use the day only, like "Sales meeting at 22:00 on Tuesday"

function createEventDescription(title: string, mentions: Mention[]) {
  const date = mentions.find((mention) => mention.attrs.id === "mention-date");
  const time = mentions.find((mention) => mention.attrs.id === "mention-time");
  // skip duration for now
  const duration = mentions.find(
    (mention) => mention.attrs.id === "mention-duration",
  );

  const prefix = date?.attrs.label === "tomorrow" ? "" : "on ";
  const description = `${title} at ${time?.attrs.label} ${prefix}${date?.attrs.label}`;

  if (description.length < 20) {
    return `${title} at ${time?.attrs.label} ${prefix}${date?.attrs.label.split(" ")[0]}`;
  }

  return description;
}

function sum(editor: Editor) {
  const json = editor?.getJSON();
  const paragraph = json?.content?.find((node) => node.type === "paragraph");
  const content = paragraph?.content?.map((node) => node.text).join("");
  const sanitizedContent = content?.replace(/\s+$/, "");

  const mentions = paragraph?.content?.filter(
    (node) => node.type === "mention",
  );

  if (!sanitizedContent || !mentions) {
    return null;
  }

  const description = createEventDescription(
    sanitizedContent,
    mentions as Mention[],
  );

  return description;
}

function useEventEditor() {}

function handleKeyDown(view: EditorView, event: KeyboardEvent) {
  if (event.key !== "Enter" || event.shiftKey) {
    return false;
  }

  // @ts-expect-error this property exists as a custom extension
  const isSuggestionActive = view.state.mention$.active;

  if (isSuggestionActive) {
    return false;
  }

  // Otherwise handle the enter key
  event.preventDefault();

  return true;
}

interface CreateEventInputProps {
  className?: string;
}

export function CreateEventInput({ className }: CreateEventInputProps) {
  const [isEmpty, setIsEmpty] = React.useState(true);

  const editor = useEditor({
    extensions: [
      Document,
      Text,
      Paragraph,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        deleteTriggerWithBackspace: true,
        suggestion: createEventInputSuggestions,
      }),
    ],
    content: "",
    injectCSS: false,
    immediatelyRender: false,
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key !== "Enter" || event.shiftKey) {
          return false;
        }

        // @ts-expect-error this property exists as a custom extension
        const isSuggestionActive = view.state.mention$.active;

        if (isSuggestionActive) {
          return false;
        }

        // Otherwise handle the enter key
        event.preventDefault();
        handleSubmit();

        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor?.getText() || "";
      setIsEmpty(content.trim().length === 0);
    },
  });

  const handleSubmit = React.useCallback(() => {
    if (!editor) return;
    const description = sum(editor);

    // handle empty content
    if (!description) {
      toast.error("Please enter a title and a date, time, or duration");
      return;
    }

    toast.success("Event created", {
      description,
    });

    editor?.commands.clearContent();
    setIsEmpty(true);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isEmpty ? <Placeholder className={className} /> : null}
      </AnimatePresence>

      <EditorContent
        editor={editor}
        placeholder="Sales meeting at @22:00"
        className={cn(
          className,
          "event-editor-content flex w-full min-w-0 items-center pl-2 text-base",
        )}
      />
    </>
  );
}

interface PlaceholderProps {
  className?: string;
}

function Placeholder({ className }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(2px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(2px)" }}
      transition={{ type: "spring", duration: 0.2 }}
      className={cn(
        className,
        "pointer-events-none absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground",
      )}
    >
      Sales meeting at @22:00
    </motion.div>
  );
}

interface CommandBarProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandBar({ children, className }: CommandBarProps) {
  return <div className={cn(className, "relative")}>{children}</div>;
}
