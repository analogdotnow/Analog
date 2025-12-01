"use client";

import * as React from "react";

import { Calendar } from "@/lib/interfaces";
import { CalendarDeleteDialog } from "./calendar-delete-dialog";
import { CalendarRenameDialog } from "./calendar-rename-dialog";

interface CalendarPickerItemContextValue {
  calendar: Calendar;
  renameDialogOpen: boolean;
  setRenameDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

const CalendarPickerItemContext =
  React.createContext<CalendarPickerItemContextValue | null>(null);

export function useCalendarPickerItem() {
  const context = React.useContext(CalendarPickerItemContext);

  if (!context) {
    throw new Error(
      "useCalendarPickerItem must be used within CalendarPickerItemProvider",
    );
  }

  return context;
}

interface CalendarPickerItemProviderProps {
  calendar: Calendar;
  children: React.ReactNode;
}

export function CalendarPickerItemProvider({
  calendar,
  children,
}: CalendarPickerItemProviderProps) {
  "use memo";

  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  return (
    <CalendarPickerItemContext.Provider
      value={{
        calendar,
        renameDialogOpen,
        setRenameDialogOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
      }}
    >
      {children}
      <CalendarRenameDialog />
      <CalendarDeleteDialog />
    </CalendarPickerItemContext.Provider>
  );
}
