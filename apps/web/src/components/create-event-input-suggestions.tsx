// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - TODO: fix properly
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";

import TimeSelector from "./time-selector";

type SuggestionItem = {
  type: "time" | "duration";
  label: string;
  value: string;
};

export default {
  items: ({ query }: { query: string }) => {
    const suggestions: SuggestionItem[] = [
      // Time suggestions
      { type: "time", label: "9:00 AM", value: "09:00" },
      { type: "time", label: "10:00 AM", value: "10:00" },
      { type: "time", label: "11:00 AM", value: "11:00" },
      { type: "time", label: "12:00 PM", value: "12:00" },
      { type: "time", label: "1:00 PM", value: "13:00" },
      { type: "time", label: "2:00 PM", value: "14:00" },
      { type: "time", label: "3:00 PM", value: "15:00" },
      { type: "time", label: "4:00 PM", value: "16:00" },
      { type: "time", label: "5:00 PM", value: "17:00" },
      { type: "time", label: "6:00 PM", value: "18:00" },
      { type: "time", label: "7:00 PM", value: "19:00" },
      { type: "time", label: "8:00 PM", value: "20:00" },
      { type: "time", label: "9:00 PM", value: "21:00" },
      { type: "time", label: "10:00 PM", value: "22:00" },
      { type: "time", label: "11:00 PM", value: "23:00" },
      { type: "time", label: "12:00 AM", value: "00:00" },
      // Duration suggestions
      { type: "duration", label: "15m", value: "15m" },
      { type: "duration", label: "30m", value: "30m" },
      { type: "duration", label: "45m", value: "45m" },
      { type: "duration", label: "1h", value: "1h" },
      { type: "duration", label: "2h", value: "2h" },
      { type: "duration", label: "3h", value: "3h" },
      { type: "duration", label: "4h", value: "4h" },
    ];

    return suggestions
      .filter((item) =>
        item.label.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 5);
  },

  render: () => {
    let component;
    let popup;

    return {
      onStart: (props) => {
        component = new ReactRenderer(TimeSelector, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide();

          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
