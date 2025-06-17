import { useCallback, type KeyboardEvent } from "react";
import { useMeasure, useUpdateEffect } from "@react-hookz/web";

import { Separator } from "@/components/ui/separator";
import { eventFormSchemaWithRepeats } from "@/lib/schemas/event-form/form";
import {
  DateGroup,
  Participants,
  TimeGroup,
  ToggleGroup,
  VideoConferencingButton,
} from "./blocks";
import { ErrorsPopover } from "./errors-popover";
import { useAppForm } from "./hooks/form";
import { useAiInput } from "./hooks/use-ai-input";
import { defaultFormOptions } from "./support/form-defaults";

const EventForm = () => {
  const [measurements, ref] = useMeasure<HTMLDivElement>();

  const form = useAppForm({
    ...defaultFormOptions,
    onSubmit: ({ value }) => {
      const data = eventFormSchemaWithRepeats.parse(value);
      console.log(data);
      form.reset();
    },
  });

  const {
    isLoading,
    data: aiData,
    enabled: aiEnabled,
  } = useAiInput(() => form.getFieldValue("title"));

  useUpdateEffect(() => {
    if (!aiData) return;
    const { startDate, endDate, ...rest } = aiData;
    form.reset(
      {
        account: form.state.values.account,
        selectedParticipants: form.state.values.selectedParticipants,
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        ...rest,
      },
      { keepDefaultValues: true },
    );
  }, [aiData]);

  const preventDefaultEnter = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLTextAreaElement) return;
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={preventDefaultEnter}
      className="w-full"
    >
      <form.AppField name="title">
        {(field) => (
          <field.TitleField
            cardSize={measurements}
            isLoading={isLoading}
            aiEnabled={aiEnabled}
          />
        )}
      </form.AppField>
      <div
        className="relative rounded-lg border border-border bg-primary-foreground shadow-md dark:shadow-accent/40"
        ref={ref}
      >
        <div className="pt-3.5 pb-4">
          <TimeGroup form={form} />
          <div className="flex flex-col gap-y-2.5">
            <DateGroup form={form} />
            <ToggleGroup form={form} />
            <form.AppField name="description">
              {(field) => <field.DescriptionField maxLength={400} />}
            </form.AppField>
            <Separator className="bg-muted-foreground/10" />
            <Participants form={form} />
            <Separator className="bg-muted-foreground/10" />
            <form.AppField name="location">
              {(field) => <field.LocationField />}
            </form.AppField>
            <Separator className="bg-muted-foreground/10" />
            <VideoConferencingButton />
            <Separator className="bg-muted-foreground/10" />
            <form.AppField name="account">
              {(field) => <field.SelectedAccountField />}
            </form.AppField>
            <Separator className="bg-muted-foreground/10" />
            <form.AppForm>
              <form.SubmitButton className="mx-auto w-[calc(100%-1.9rem)] dark:w-[calc(100%-2rem)]" />
            </form.AppForm>
          </div>
          <form.Subscribe selector={(state) => state.errorMap}>
            {(errors) =>
              errors.onChange && (
                <ErrorsPopover
                  className="absolute -top-3 right-3 z-30 -translate-y-full"
                  side="bottom"
                  sideOffset={5}
                  align="end"
                  alignOffset={-14}
                  errors={errors.onChange}
                />
              )
            }
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
};

export default EventForm;
