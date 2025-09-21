import { activeLayoutAtom } from "@/atoms/active-layout";
import { useAtomValue } from "jotai";
import * as React from "react";
import type { Form } from "./use-event-form";

export function useSubmitOnClickOutside(form: Form) {
  const activeLayout = useAtomValue(activeLayoutAtom);

  React.useEffect(() => {
    if (activeLayout === "form") {
      return;
    }

    form.handleSubmit();
  }, [activeLayout, form]);
}