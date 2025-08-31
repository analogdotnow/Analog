"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  SwatchIcon,
} from "@heroicons/react/16/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";

import { authClient } from "@repo/auth/client";

import { SettingsDialog } from "@/components/settings-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";

export function NavUser() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const query = useQuery(trpc.user.me.queryOptions());
  const { theme, setTheme } = useTheme();

  if (query.isLoading) {
    return <NavUserSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={query.data?.image ?? undefined}
                  alt={query.data?.name}
                />
                <AvatarFallback className="rounded-lg">
                  {query.data?.name
                    ?.split(" ")
                    .map((name) => name.charAt(0))
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={query.data?.image ?? undefined}
                    alt={query.data?.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {query.data?.name
                      ?.split(" ")
                      .map((name) => name.charAt(0))
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {query.data?.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {query.data?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SettingsDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Cog6ToothIcon />
                  Settings
                </DropdownMenuItem>
              </SettingsDialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <SwatchIcon className="size-4" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-64">
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="system">
                      Automatic (system)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      Dark
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () =>
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      queryClient.removeQueries();
                      router.push("/login");
                    },
                  },
                })
              }
            >
              <ArrowRightStartOnRectangleIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <Skeleton className="animate-shimmer size-8 rounded-lg bg-neutral-500/20" />
          <div className="flex-1 space-y-1">
            <Skeleton className="animate-shimmer rounded- h-4 w-full bg-neutral-500/20" />
            <Skeleton className="animate-shimmer rounded- h-2 w-full bg-neutral-500/20" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
