import * as React from "react";
import { Check, ChevronRight } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

function useCalendarList() {
  const trpc = useTRPC();

  return useQuery(trpc.calendars.list.queryOptions());
}

export function Calendars() {
  const { data } = useCalendarList();

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
                className="group/label hover:bg-sidebar-accent w-full text-sm"
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
                              <div
                                data-active={index < 2}
                                className="group/calendar-item border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border"
                              >
                                <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                              </div>
                              <span className="line-clamp-1 block">{item.name}</span>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start" sideOffset={8} className="bg-sidebar-accent text-sidebar-accent-foreground">
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
