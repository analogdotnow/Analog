import * as React from "react";

import { useCalendarStore } from "@/providers/calendar-store-provider";
import type { Form } from "./use-event-form";

export function useSubmitOnClickOutside(form: Form) {
  const activeLayout = useCalendarStore((s) => s.activeLayout);

  React.useEffect(() => {
    if (activeLayout === "form") {
      return;
    }

    form.handleSubmit();
  }, [activeLayout, form]);
}
