import { type MentionOptions } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance, Props } from "tippy.js";

import { generateDateSuggestions } from "@/lib/event-input";
import {
  DURATION_SUGGESTIONS,
  SUGGESTION_LIMITS,
  TIME_SUGGESTIONS,
} from "./constants";
import { TimeSelector, type TimeSelectorProps } from "./time-selector";

type MentionSuggestion = MentionOptions["suggestion"];

type SuggestionItem = {
  type: "time" | "duration" | "date";
  label: string;
  value: string;
};

export const createEventInputSuggestions: MentionSuggestion = {
  allowSpaces: true,
  items: ({ query }: { query: string }) => {
    const suggestions: SuggestionItem[] = [
      ...TIME_SUGGESTIONS.map(({ label, value }) => ({
        type: "time" as const,
        label,
        value,
      })),
      ...DURATION_SUGGESTIONS.map(({ label, value }) => ({
        type: "duration" as const,
        label,
        value,
      })),
    ];

    const dateSuggestions = generateDateSuggestions(query);
    suggestions.push(...dateSuggestions);

    return suggestions
      .filter((item) => {
        if (item.type === "date") {
          return true;
        }
        return item.label.toLowerCase().startsWith(query.toLowerCase());
      })
      .reduce((acc, item) => {
        const sameTypeCount = acc.filter((i) => i.type === item.type).length;
        const maxCount = SUGGESTION_LIMITS[item.type];
        if (sameTypeCount < maxCount) {
          acc.push(item);
        }
        return acc;
      }, [] as SuggestionItem[]);
  },

  render: () => {
    let component: ReactRenderer<unknown, TimeSelectorProps>;
    let popup: Instance<Props>;

    return {
      onStart: (props) => {
        component = new ReactRenderer(TimeSelector, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy(document.body, {
          getReferenceClientRect: () => {
            const rect = props.clientRect?.();
            return rect || new DOMRect();
          },
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

        popup?.setProps({
          getReferenceClientRect: () => {
            const rect = props.clientRect?.();
            return rect || new DOMRect();
          },
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup?.hide();
          return true;
        }

        // @ts-expect-error TODO: correctly type this somehow
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup?.destroy();
        component.destroy();
      },
    };
  },
};
