import { useFieldContext } from "@/components/event-form/hooks/form-context";
import { accounts } from "@/components/event-form/support/accounts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getAccountNameParts = (name: string) => {
  if (name.includes("@")) {
    const parts = name.split("@");
    return [parts[0], `@${parts[1]}`];
  }
  return [name, ""];
};

const SelectedAccount = () => {
  const field = useFieldContext<string>();

  return (
    <>
      <Label htmlFor="selected-account" className="sr-only">
        Selected Account
      </Label>
      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger
          id="selected-account"
          aria-invalid={field.state.meta.isValid === false}
          className="border-none! bg-transparent! px-0.5 shadow-none focus-visible:ring-0 *:data-[slot=select-value]:gap-2.5 *:data-[slot=select-value]:overflow-visible dark:px-1 [&_span[data-account-name]]:rounded-sm [&_span[data-account-name]]:ring-ring/50 [&_span[data-account-name]]:ring-offset-2 [&_span[data-account-name]]:ring-offset-sidebar focus-visible:[&_span[data-account-name]]:ring-2 hover:[&_svg]:text-foreground [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
        >
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2.5">
          <SelectGroup>
            {accounts.map((account) => {
              const nameParts = getAccountNameParts(account.email);
              return (
                <SelectItem value={account.email} key={account.email}>
                  <Avatar
                    className="size-5 rounded bg-calendar-accent text-calendar-foreground"
                    style={
                      {
                        "--calendar-tint": `var(--calendar-${account.color})`,
                      } as React.CSSProperties
                    }
                  >
                    <AvatarFallback className="bg-transparent select-none">
                      {account.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="inline-flex select-none" data-account-name>
                    <span className="max-w-32 truncate">{nameParts[0]}</span>
                    <span className="block flex-1 text-left">
                      {nameParts[1]}
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectedAccount;
