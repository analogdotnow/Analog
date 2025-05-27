import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight } from "lucide-react";

import { useCalendarsVisibility } from "@/components/event-calendar/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/lib/trpc/client";

function useCalendarList() {
  const trpc = useTRPC();

  return useQuery(trpc.calendars.list.queryOptions());
}

export function Calendars() {
  const { data } = useCalendarList();
  const [calendarsVisibility, setCalendarsVisibility] =
    useCalendarsVisibility();

  const handleCalendarVisibilityChange = React.useCallback(
    (checked: boolean, calendarId: string) => {
      const newHiddenCalendars = checked
        ? calendarsVisibility.hiddenCalendars.filter((id) => id !== calendarId)
        : [...calendarsVisibility.hiddenCalendars, calendarId];

      setCalendarsVisibility({
        hiddenCalendars: newHiddenCalendars,
      });
    },
    [calendarsVisibility.hiddenCalendars, setCalendarsVisibility],
  );

  if (!data) {
    return null;
  }

  return (
    <>
      {data.accounts.map((account, index) => (
        <React.Fragment key={account.name}>
          <SidebarGroup key={account.name} className="py-0">
            <Collapsible
              defaultOpen={index === 0}
              className="group/collapsible"
            >
              <SidebarGroupLabel
                asChild
                className="group/label w-full text-sm hover:bg-sidebar-accent"
              >
                <CollapsibleTrigger>
                  {account.name}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {account.calendars.map((item, index) => (
                      <SidebarMenuItem key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton>
                              <Checkbox
                                checked={
                                  !calendarsVisibility.hiddenCalendars.includes(
                                    item.id,
                                  )
                                }
                                onCheckedChange={(checked: boolean) => {
                                  handleCalendarVisibilityChange(
                                    checked,
                                    item.id,
                                  );
                                }}
                              />
                              <span className="line-clamp-1 block">
                                {item.name}
                              </span>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="start"
                            sideOffset={8}
                            className="bg-sidebar-accent text-sidebar-accent-foreground"
                          >
                            <span>{item.name}</span>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator className="mx-0" />
        </React.Fragment>
      ))}
    </>
  );
}
