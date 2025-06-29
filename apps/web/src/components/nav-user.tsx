"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut, Plus, UserRound, Bell, BellOff, Send, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

import { authClient } from "@repo/auth/client";

import { AddAccountDialog } from "@/components/add-account-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/accounts";
import { useNotifications } from "@/hooks/use-notifications";

export function NavUser() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localSubscriptionState, setLocalSubscriptionState] = useState<boolean | null>(null);

  const { data: user, isLoading } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const { isSupported, isSubscribed, isLoading: notificationsLoading, subscribe, unsubscribe } = useNotifications();

  const subState = localSubscriptionState !== null ? localSubscriptionState : isSubscribed;

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const toggleNotifications = async () => {
    setLocalSubscriptionState(!subState);
    setDropdownOpen(false);
    
    try {
      if (subState) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      setLocalSubscriptionState(subState);
      console.error("Failed to toggle notifications:", error);
    }
  };

  const sendTestNotification = async () => {
    if (!user?.id) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/test-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "Test Notification",
          body: "This is a test notification from Analog Calendar!",
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Notification sent! ${result.successful}/${result.total} successful`);
      } else {
        toast.error(result.error || "Failed to send notification");
      }
    } catch {
      toast.error("Failed to send test notification");
    } finally {
      setIsSending(false);
    }
  };

  const createTestReminder = async () => {
    if (!user?.id) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/test-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "Test Reminder",
          body: "This is a test reminder that will trigger in 1 minute",
          minutesFromNow: 1,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success("Test reminder created! Check back in 1 minute for the notification.");
      } else {
        toast.error(result.error || "Failed to create reminder");
      }
    } catch {
      toast.error("Failed to create test reminder");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <NavUserSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
                <AvatarFallback className="rounded-lg bg-accent-foreground text-background">
                  {user?.name
                    ?.split(" ")
                    .map((name) => name.charAt(0))
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            key={`dropdown-${subState}-${notificationsLoading}`}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.image ?? undefined}
                    alt={user?.name}
                  />
                  <AvatarFallback className="rounded-lg"></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserRound />
                Account
              </DropdownMenuItem>
              <AddAccountDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus />
                  Add account
                </DropdownMenuItem>
              </AddAccountDialog>
            </DropdownMenuGroup>
            {isSupported && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleNotifications();
                    }}
                    disabled={notificationsLoading}
                  >
                    {subState ? <BellOff /> : <Bell />}
                    {subState ? "Disable" : "Enable"} notifications
                  </DropdownMenuItem>
                  {subState && (
                    <>
                      <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          sendTestNotification();
                        }}
                        disabled={isSending}
                      >
                        <Send />
                        Send test notification
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          createTestReminder();
                        }}
                        disabled={isSending}
                      >
                        <Clock />
                        Create test reminder
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </>
            )}
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
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function NavUserSkeleton() {
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
