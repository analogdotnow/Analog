"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";

import { usePlacesSearch } from "@/components/event-form/location/use-places-search";
import type { FormConference } from "@/components/event-form/utils/schema";
import { GoogleMeet } from "@/components/icons";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteStatus,
} from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";
import { ConferenceFieldDropdown } from "./conference-field-dropdown";
import { LocationFieldDropdown } from "./location-field-dropdown";
import { isConferenceLink } from "./utils";

interface LocationFieldProps {
  className?: string;
  id?: string;
  name?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  conference: FormConference | null | undefined;
  onRemoveConference?: () => void;
}

interface AddressSuggestion {
  value: string;
  label: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

function useLocationInput(value: string | null | undefined) {
  const [inputValue, setInputValue] = React.useState(() =>
    typeof value === "string" ? value : "",
  );

  React.useEffect(() => {
    const nextValue = typeof value === "string" ? value : "";

    setInputValue((current) => (current === nextValue ? current : nextValue));
  }, [value]);

  return React.useMemo(
    () => [inputValue, setInputValue] as const,
    [inputValue, setInputValue],
  );
}

interface UseLocationSuggestionsOptions {
  enabled: boolean;
}

function useLocationSuggestions(
  inputValue: string,
  options?: UseLocationSuggestionsOptions,
) {
  const debouncedSearch = useDebounce(inputValue, 300);

  const { data, isFetching } = usePlacesSearch(
    {
      input: debouncedSearch,
      language: "en",
    },
    options,
  );

  const suggestions = React.useMemo<AddressSuggestion[]>(() => {
    if (!data) {
      return [];
    }

    return data.suggestions
      .filter((suggestion) => suggestion.placePrediction !== undefined)
      .map((suggestion) => {
        const placeId = suggestion.placePrediction!.placeId!;
        const label = suggestion.placePrediction!.text!.text!;

        return { value: placeId, label } satisfies AddressSuggestion;
      });
  }, [data]);

  const status = React.useMemo(() => {
    if (isFetching && suggestions.length === 0) {
      return "Searching for addresses…";
    }

    if (debouncedSearch.trim() === "") {
      return undefined;
    }

    if (suggestions.length === 0) {
      return "No address found.";
    }

    return undefined;
  }, [debouncedSearch, isFetching, suggestions.length]);

  const isLoading = useDebounce(isFetching && suggestions.length === 0, 300);

  return {
    suggestions,
    isLoading,
    status,
  };
}

export function LocationField({
  className,
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  conference,
  onRemoveConference,
}: LocationFieldProps) {
  "use memo";

  const [inputValue, setInputValue] = useLocationInput(value);
  const { suggestions, isLoading, status } = useLocationSuggestions(inputValue);

  const isVideoCall = isConferenceLink({ location: inputValue, conference });

  return (
    <div className="relative flex items-center gap-x-1">
      <Autocomplete
        name={name}
        items={suggestions}
        value={isVideoCall ? "" : inputValue}
        onValueChange={(value) => {
          if (value === "conference.create:google.meet") {
            return;
          }

          if (isVideoCall) {
            return;
          }

          setInputValue(value);
          onChange?.(value);
        }}
        filter={null}
        openOnInputClick={!disabled}
      >
        <AutocompleteInput
          id={id}
          placeholder={
            isVideoCall ? "Add video call" : "Add video call or location"
          }
          autoComplete="off"
          className={cn(
            "h-8 grow resize-none border-none bg-transparent py-1 ps-8 text-sm shadow-none dark:bg-transparent",
            className,
          )}
          onBlur={(event) => {
            if (isVideoCall) {
              return;
            }

            onBlur?.(event);
          }}
          disabled={disabled}
        />
        <AutocompletePositioner>
          <AutocompletePopup>
            {!isVideoCall ? (
              <>
                <AutocompleteList>
                  {isLoading ? <LocationFieldLoading /> : null}
                  {suggestions.length > 0 ? <LocationFieldSuggestions /> : null}
                </AutocompleteList>
                {status ? (
                  <AutocompleteStatus>{status}</AutocompleteStatus>
                ) : null}
              </>
            ) : null}
            {suggestions.length === 0 ? (
              <LocationFieldConferenceOptions />
            ) : null}
          </AutocompletePopup>
        </AutocompletePositioner>
      </Autocomplete>
      {conference?.type === "conference" ? (
        <ConferenceFieldDropdown
          conference={conference}
          disabled={disabled}
          onDelete={onRemoveConference}
        />
      ) : null}
      {!isVideoCall && inputValue.trim() !== "" ? (
        <>
          <LocationFieldDropdown
            location={inputValue}
            disabled={disabled}
            onDelete={() => onChange?.("")}
          />
          {/* <LocationWeather location={inputValue} disabled={disabled} /> */}
        </>
      ) : null}
    </div>
  );
}

function LocationFieldSuggestions() {
  return (
    <AutocompleteCollection>
      {(item: AddressSuggestion) => (
        <LocationFieldItem key={item.value} item={item} />
      )}
    </AutocompleteCollection>
  );
}

function LocationFieldLoading() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      Searching…
    </div>
  );
}

function LocationFieldConferenceOptions() {
  return (
    <AutocompleteGroup className="p-1">
      <AutocompleteGroupLabel>Add video call</AutocompleteGroupLabel>

      <AutocompleteItem className="gap-2" value="conference.create:google.meet">
        <GoogleMeet className="h-4 w-4" />
        Google Meet
      </AutocompleteItem>
    </AutocompleteGroup>
  );
}

interface LocationFieldItemProps {
  item: AddressSuggestion;
}

function LocationFieldItem({ item }: LocationFieldItemProps) {
  "use memo";

  const [primaryText, secondaryText] = item.label.split(/,(.+)/);

  return (
    <AutocompleteItem value={item}>
      <div className="flex items-baseline gap-1 truncate">
        <span className="truncate">{primaryText}</span>
        {secondaryText ? (
          <span className="truncate text-xs text-muted-foreground">
            {secondaryText}
          </span>
        ) : null}
      </div>
    </AutocompleteItem>
  );
}
