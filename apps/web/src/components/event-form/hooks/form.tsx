import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import {
  DescriptionField,
  LocationField,
  SelectedAccountField,
  TitleField,
} from "@/components/event-form/blocks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

function SubmitButton({ className }: { className?: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
      {([isSubmitting, canSubmit]) => (
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={cn(
            "bg-blue-600 select-none hover:bg-blue-600/90 focus-visible:ring-blue-400/50 dark:bg-blue-500 dark:hover:bg-blue-500/90 dark:focus-visible:ring-blue-400/50",
            className,
          )}
          onClick={form.handleSubmit}
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      )}
    </form.Subscribe>
  );
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    DescriptionField,
    LocationField,
    TitleField,
    SelectedAccountField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
