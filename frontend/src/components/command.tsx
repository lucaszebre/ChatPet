import {
  CommandDialog as CommandDialogPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  Command as CommandPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
  CommandShortcut as CommandShortcutPrimitive,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import React from "react";

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  value?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandGroup {
  title?: string;
  items: CommandItem[];
}

export interface CommandProps {
  groups?: CommandGroup[];
  items?: CommandItem[];

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;

  placeholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  emptyText?: string;
  emptyComponent?: React.ReactNode;

  title?: string;
  description?: string;
  showCloseButton?: boolean;

  className?: string;
  dialogClassName?: string;
  inputClassName?: string;
  listClassName?: string;

  filter?: (value: string, search: string) => number;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;

  children?: React.ReactNode;
  loading?: boolean;

  trigger?: React.ReactNode;
}

export const Command = ({
  groups = [],
  items = [],
  open,
  onOpenChange,
  placeholder = "Type a command or search...",
  searchValue,
  onSearchChange,
  emptyText = "No results found.",
  emptyComponent,
  title = "Command Palette",
  description = "Type a command or search...",
  showCloseButton = true,
  className,
  dialogClassName,
  inputClassName,
  listClassName,
  filter,
  defaultValue,
  value,
  onValueChange,
  children,
  loading = false,
  trigger,
}: CommandProps) => {
  const [internalSearchValue, setInternalSearchValue] = React.useState("");
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  const currentSearchValue =
    searchValue !== undefined ? searchValue : internalSearchValue;
  const handleSearchChange = onSearchChange || setInternalSearchValue;

  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  const allGroups = React.useMemo(() => {
    const result: CommandGroup[] = [...groups];

    if (items.length > 0) {
      result.unshift({ items });
    }

    return result;
  }, [groups, items]);

  const renderCommandContent = () => (
    <CommandPrimitive
      className={cn("h-full", className)}
      filter={filter}
      value={currentValue}
      onValueChange={handleValueChange}
    >
      <CommandInputPrimitive
        placeholder={placeholder}
        value={currentSearchValue}
        onValueChange={handleSearchChange}
        className={inputClassName}
      />
      <CommandListPrimitive className={cn("max-h-[300px]", listClassName)}>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <>
            <CommandEmptyPrimitive>
              {emptyComponent || emptyText}
            </CommandEmptyPrimitive>

            {allGroups.map((group, groupIndex) => (
              <CommandGroupPrimitive key={groupIndex} heading={group.title}>
                {group.items.map((item) => (
                  <CommandItemPrimitive
                    key={item.id}
                    value={item.value || item.title}
                    disabled={item.disabled}
                    onSelect={() => {
                      item.onSelect?.();
                      if (open !== undefined && onOpenChange) {
                        onOpenChange(false);
                      }
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {item.icon && (
                      <span className="mr-2 h-4 w-4 shrink-0">{item.icon}</span>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.shortcut && (
                      <CommandShortcutPrimitive>
                        {item.shortcut}
                      </CommandShortcutPrimitive>
                    )}
                  </CommandItemPrimitive>
                ))}
                {groupIndex < allGroups.length - 1 && (
                  <CommandSeparatorPrimitive />
                )}
              </CommandGroupPrimitive>
            ))}

            {children}
          </>
        )}
      </CommandListPrimitive>
    </CommandPrimitive>
  );

  if (open !== undefined || trigger) {
    return (
      <CommandDialogPrimitive
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        showCloseButton={showCloseButton}
        className={dialogClassName}
      >
        {renderCommandContent()}
      </CommandDialogPrimitive>
    );
  }

  return renderCommandContent();
};
