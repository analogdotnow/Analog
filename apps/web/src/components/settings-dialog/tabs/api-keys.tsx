import * as React from "react";
import { format } from "@formkit/tempo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ApiKey as BaseApiKey } from "@repo/auth/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc/client";
import {
  SettingsPage,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "./settings-page";

interface ApiKey extends BaseApiKey {
  key?: string; // Optional since the API might not return this for security reasons
}

interface ApiKeyForm {
  name: string;
  expiresIn: string;
  prefix: string;
  permissions: Record<string, string[]>;
  metadata: Record<string, string>;
}

const PERMISSION_OPTIONS = {
  calendars: ["read", "write"],
  events: ["read", "write", "delete"],
  accounts: ["read"],
  files: ["read", "write"],
} as const;

const EXPIRATION_OPTIONS = [
  { value: "0", label: "Never" },
  { value: String(7 * 24 * 60 * 60), label: "7 days" },
  { value: String(30 * 24 * 60 * 60), label: "30 days" },
  { value: String(90 * 24 * 60 * 60), label: "90 days" },
  { value: String(365 * 24 * 60 * 60), label: "1 year" },
];

// Unified API operations - contains all queries and mutations for API keys
function useApiKeys() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const list = useQuery(trpc.apiKeys.list.queryOptions());

  const create = useMutation(
    trpc.apiKeys.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.apiKeys.pathKey() });
        toast.success("API key created successfully");
      },
      onError: (error) => {
        console.error("Failed to create API key:", error);
        toast.error("Failed to create API key");
      },
    }),
  );

  const update = useMutation(
    trpc.apiKeys.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.apiKeys.pathKey() });
        toast.success("API key updated successfully");
      },
      onError: (error) => {
        console.error("Failed to update API key:", error);
        toast.error("Failed to update API key");
      },
    }),
  );

  const deleteKey = useMutation(
    trpc.apiKeys.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.apiKeys.pathKey() });
        toast.success("API key deleted successfully");
      },
      onError: (error) => {
        console.error("Failed to delete API key:", error);
        toast.error("Failed to delete API key");
      },
    }),
  );

  return {
    list,
    create,
    update,
    deleteKey,
  };
}

function ApiKeysList({
  newlyCreatedKeys,
  setNewlyCreatedKeys,
}: {
  newlyCreatedKeys: Map<string, string>;
  setNewlyCreatedKeys: React.Dispatch<
    React.SetStateAction<Map<string, string>>
  >;
}) {
  const { list, deleteKey } = useApiKeys();

  const handleDeleteApiKey = (keyId: string) => {
    deleteKey.mutate({ keyId });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (list.isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-96" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (list.isError) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Error loading API keys. Please try again.
        </p>
      </div>
    );
  }

  if (!list.data?.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No API keys found. Create your first API key to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.data.map((apiKey: ApiKey) => (
        <div key={apiKey.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{apiKey.name || "Unnamed Key"}</h4>
                {!apiKey.enabled && <Badge variant="secondary">Disabled</Badge>}
                {apiKey.expiresAt &&
                  new Date(apiKey.expiresAt) < new Date() && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                {newlyCreatedKeys.has(apiKey.id) && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Available to copy
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span>
                  {apiKey.start ||
                    "••••••••••••••••••••••••••••••••••••••••••••"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const fullKey =
                      apiKey.key || newlyCreatedKeys.get(apiKey.id);
                    if (fullKey) {
                      copyToClipboard(fullKey);
                      const isNewlyCreated = newlyCreatedKeys.has(apiKey.id);
                      if (isNewlyCreated) {
                        toast.success(
                          "API key copied to clipboard! This is the only time you'll be able to copy the full key.",
                        );
                        // Optionally clear the key from storage after first copy for security
                        // Uncomment the next 4 lines if you want to clear after first copy:
                        // setNewlyCreatedKeys(prev => {
                        //   const newMap = new Map(prev);
                        //   newMap.delete(apiKey.id);
                        //   return newMap;
                        // });
                      } else {
                        toast.success("API key copied to clipboard");
                      }
                    } else {
                      toast.info("Full API key is only visible when created");
                    }
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex gap-1">
              <ApiKeyDialog
                apiKey={apiKey}
                onNewKeyCreated={setNewlyCreatedKeys}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Created {format(apiKey.createdAt, "MMM D, YYYY")}</span>
            {apiKey.expiresAt && (
              <span>• Expires {format(apiKey.expiresAt, "MMM D, YYYY")}</span>
            )}
            {apiKey.requestCount !== null && (
              <span>• {apiKey.requestCount} requests</span>
            )}
            {apiKey.rateLimitMax && (
              <span>• {apiKey.rateLimitMax}/day limit</span>
            )}
          </div>
          {apiKey.permissions && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(apiKey.permissions).map(([resource, actions]) =>
                (actions as string[]).map((action: string) => (
                  <Badge
                    key={`${resource}:${action}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {resource}:{action}
                  </Badge>
                )),
              )}
            </div>
          )}
          {newlyCreatedKeys.has(apiKey.id) && (
            <div className="mt-3 space-y-2 rounded-md bg-green-50 p-3 dark:bg-green-950">
              <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                Full API Key (available for limited time):
              </Label>
              <Input
                value={newlyCreatedKeys.get(apiKey.id) || ""}
                readOnly
                className="bg-white font-mono text-sm dark:bg-gray-800"
                onClick={(e) => {
                  e.currentTarget.select();
                  copyToClipboard(newlyCreatedKeys.get(apiKey.id) || "");
                  toast.success("API key copied to clipboard!");
                }}
              />
              <p className="text-xs text-green-700 dark:text-green-300">
                Click the field above to select and copy the full key. This key
                will only be visible for 5 minutes after creation.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ApiKeyDialog({
  apiKey,
  onNewKeyCreated,
}: {
  apiKey?: ApiKey;
  onNewKeyCreated: React.Dispatch<React.SetStateAction<Map<string, string>>>;
}) {
  const [open, setOpen] = React.useState(false);
  const isEdit = !!apiKey;

  const [form, setForm] = React.useState<ApiKeyForm>({
    name: apiKey?.name || "",
    expiresIn: "0",
    prefix: apiKey?.prefix || "",
    permissions: apiKey?.permissions || {},
    metadata: apiKey?.metadata || {},
  });
  const [metadataInput, setMetadataInput] = React.useState(
    apiKey?.metadata ? JSON.stringify(apiKey.metadata, null, 2) : "",
  );

  const { create, update } = useApiKeys();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let metadata: Record<string, string> = {};
      if (metadataInput.trim()) {
        metadata = JSON.parse(metadataInput);
      }

      if (isEdit) {
        update.mutate(
          {
            keyId: apiKey.id,
            name: form.name || undefined,
          },
          {
            onSuccess: () => {
              setOpen(false);
            },
          },
        );
      } else {
        const expiresIn =
          form.expiresIn === "0" ? undefined : parseInt(form.expiresIn);

        create.mutate(
          {
            name: form.name || undefined,
            expiresIn,
            prefix: form.prefix || undefined,
            metadata,
            permissions:
              Object.keys(form.permissions).length > 0
                ? form.permissions
                : undefined,
          },
          {
            onSuccess: (createdApiKey) => {
              // Store the newly created API key for copying
              if (createdApiKey?.id && createdApiKey?.key) {
                onNewKeyCreated((prev) =>
                  new Map(prev).set(createdApiKey.id, createdApiKey.key),
                );

                // Clear the key from temporary storage after 5 minutes for security
                setTimeout(
                  () => {
                    onNewKeyCreated((prev) => {
                      const newMap = new Map(prev);
                      newMap.delete(createdApiKey.id);
                      return newMap;
                    });
                  },
                  5 * 60 * 1000,
                );
              }

              setOpen(false);
              setForm({
                name: "",
                expiresIn: "0",
                prefix: "",
                permissions: {},
                metadata: {},
              });
              setMetadataInput("");
            },
          },
        );
      }
    } catch {
      toast.error("Invalid metadata JSON format");
    }
  };

  const togglePermission = (resource: string, action: string) => {
    setForm((prev) => {
      const newPermissions = { ...prev.permissions };
      if (!newPermissions[resource]) {
        newPermissions[resource] = [];
      }

      if (newPermissions[resource].includes(action)) {
        newPermissions[resource] = newPermissions[resource].filter(
          (a) => a !== action,
        );
        if (newPermissions[resource].length === 0) {
          delete newPermissions[resource];
        }
      } else {
        newPermissions[resource] = [...newPermissions[resource], action];
      }

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Update" : "Create"} API Key</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the name and configuration of your API key."
                : "Create a new API key to access your calendar data programmatically."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My API Key"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {!isEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefix (optional)</Label>
                  <Input
                    id="prefix"
                    placeholder="my-app"
                    value={form.prefix}
                    onChange={(e) =>
                      setForm({ ...form, prefix: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires In</Label>
                  <Select
                    value={form.expiresIn}
                    onValueChange={(value) =>
                      setForm({ ...form, expiresIn: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metadata">Metadata (JSON, optional)</Label>
                  <Textarea
                    id="metadata"
                    placeholder='{"environment": "production"}'
                    value={metadataInput}
                    onChange={(e) => setMetadataInput(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-3">
                {Object.entries(PERMISSION_OPTIONS).map(
                  ([resource, actions]) => (
                    <div key={resource} className="space-y-2">
                      <Label className="text-sm font-medium capitalize">
                        {resource}
                      </Label>
                      <div className="space-y-1 pl-4">
                        {actions.map((action) => (
                          <div
                            key={`${resource}:${action}`}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${resource}:${action}`}
                              checked={
                                form.permissions[resource]?.includes(action) ||
                                false
                              }
                              onCheckedChange={() =>
                                togglePermission(resource, action)
                              }
                            />
                            <Label
                              htmlFor={`${resource}:${action}`}
                              className="text-sm capitalize"
                            >
                              {action}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isEdit ? update.isPending : create.isPending}
            >
              {isEdit
                ? update.isPending
                  ? "Updating..."
                  : "Update API Key"
                : create.isPending
                  ? "Creating..."
                  : "Create API Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeys() {
  const [newlyCreatedKeys, setNewlyCreatedKeys] = React.useState<
    Map<string, string>
  >(new Map());

  // Clear all stored keys when component unmounts for security
  React.useEffect(() => {
    return () => {
      setNewlyCreatedKeys(new Map());
    };
  }, []);

  return (
    <SettingsPage>
      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>API Keys</SettingsSectionTitle>
          <SettingsSectionDescription>
            Manage API keys to access your calendar data programmatically.
          </SettingsSectionDescription>
        </SettingsSectionHeader>
        <ApiKeyDialog onNewKeyCreated={setNewlyCreatedKeys} />
        <ApiKeysList
          newlyCreatedKeys={newlyCreatedKeys}
          setNewlyCreatedKeys={setNewlyCreatedKeys}
        />
      </SettingsSection>
    </SettingsPage>
  );
}

// Exported unified API hook for external use
export { useApiKeys };
