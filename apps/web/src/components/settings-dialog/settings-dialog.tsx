import { useState } from "react";
import { Cog6ToothIcon, UsersIcon } from "@heroicons/react/16/solid";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accounts } from "./tabs/accounts";
import { ApiKeys } from "./tabs/api-keys";
import { General } from "./tabs/general";

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="h-144 max-h-screen w-full rounded-2xl bg-background p-0 sm:max-w-4xl"
        autoFocus={false}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <div className="relative flex">
          <Tabs
            defaultValue="general"
            orientation="vertical"
            className="flex h-full w-full flex-row gap-0"
          >
            <div className="rounded-l-[calc(var(--radius-2xl)-1px)] bg-neutral-800/20">
              <TabsList className="h-fit w-56 shrink-0 flex-col gap-1 bg-transparent p-3">
                <TabsTrigger
                  value="general"
                  className="w-full justify-start gap-3 border-none py-1.5 hover:bg-muted hover:text-accent-foreground data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:hover:bg-muted data-[state=active]:hover:text-foreground"
                >
                  <Cog6ToothIcon className="size-4 text-muted-foreground" />{" "}
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="accounts"
                  className="w-full justify-start gap-3 border-none py-1.5 hover:bg-muted hover:text-accent-foreground data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:hover:bg-muted data-[state=active]:hover:text-foreground"
                >
                  <UsersIcon className="size-4 text-muted-foreground" />{" "}
                  Accounts
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-3 text-start">
              <div className="h-full w-full overflow-auto">
                <TabsContent value="accounts" className="mt-0 h-full">
                  <Accounts />
                </TabsContent>
                <TabsContent value="general" className="mt-0 h-full">
                  <General />
                </TabsContent>
                <TabsContent value="api" className="mt-0 h-full">
                  <ApiKeys />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
