import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { X, CalendarIcon, Plus } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function AddTask({ accountId, categories }: {
    accountId: string,
    categories: { id: string; title: string }[],
  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const trpc = useTRPC();
    const queryClient = useQueryClient();
  
    const createTaskMutation = useMutation(
      trpc.tasks.createTask.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: trpc.tasks.list.queryKey() });
          setIsOpen(false);
          setTaskTitle("");
          setTaskDescription("");
          setSelectedDate(new Date());
          setSelectedCategory("");
        },
      })
    );
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!taskTitle.trim() || !selectedCategory) return;
  
      createTaskMutation.mutate({
        accountId,
        categoryId: selectedCategory,
        task: {
          title: taskTitle.trim(),
          notes: taskDescription.trim() || undefined,
          due: selectedDate?.toISOString(),
          status: "needsAction",
        },
      });
    };
  
    const handleCancel = () => {
      setIsOpen(false);
      setTaskTitle("");
      setTaskDescription("");
      setSelectedDate(new Date());
      setSelectedCategory("");
    };
  
    if (isOpen) {
      return (
        <SidebarMenuItem className="group/item">
          <div className="relative w-full">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="absolute top-2 right-2 h-6 w-6 p-0 text-neutral-400 hover:text-white"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </Button>
            <form onSubmit={handleSubmit} className="flex flex-col mt-2">
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Title"
                className="border-none shadow-none rounded-md bg-transparent dark:bg-transparent focus:ring-0 dark:focus:ring-0 placeholder:text-neutral-400"
                autoFocus
              />
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Description"
                className="border-none shadow-none rounded-md bg-transparent dark:bg-transparent focus:ring-0 dark:focus:ring-0"
              />
              <div className="flex gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-start text-left font-normal border-none h-auto rounded-full bg-neutral-800"
                    >
                      <CalendarIcon className="size-4" />{selectedDate ? format(selectedDate, "dd MMM") : "Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1 border-none shadow-none rounded-full bg-neutral-800">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="line-clamp-1">{category.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  variant="secondary" size="icon" className="size-8 bg-neutral-600/20 hover:bg-neutral-600 disabled:opacity-50"
                  disabled={!taskTitle.trim() || !selectedCategory || createTaskMutation.isPending}
                >
                  <Plus />
                </Button>
              </div>
            </form>
          </div>
        </SidebarMenuItem>
      );
    }
  
    return (
      <SidebarMenuItem className="group/item">
        <SidebarMenuButton
          onClick={() => setIsOpen(true)}
          className="hover:bg-neutral-600/20"
        >
          <div className="relative flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            <span className="line-clamp-1 block select-none">
              Add task
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  