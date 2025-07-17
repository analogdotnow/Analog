import { Extension } from "@tiptap/react";

export const ExitLinkOnSpace = Extension.create({
  name: "exitLinkOnSpace",
  addKeyboardShortcuts() {
    return {
      Space: ({ editor }) => {
        if (editor.isActive("link")) {
          // Insert a space character first
          editor.commands.insertContent(" ");

          // Then explicitly unset the link mark
          editor.commands.unsetLink();

          return true;
        }
        return false;
      },
    };
  },
});
