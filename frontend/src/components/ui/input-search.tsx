"use client";

import { useId } from "react";

import { LoaderCircleIcon, SearchIcon, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./button";

export interface InputSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
  onClear?: () => void;
  disabled?: boolean;
}

export const InputSearch = ({
  value,
  onChange,
  isLoading = false,
  placeholder = "Search...",
  label = "",
  onClear,
  disabled = false,
}: InputSearchProps) => {
  const id = useId();

  return (
    <div className="w-full max-w-xs space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon className="size-4" />
          <span className="sr-only">Search</span>
        </div>
        <Input
          id={id}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="peer px-9  border-none outline-none  shadow-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
        />

        {isLoading && (
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
            <LoaderCircleIcon className="size-4 animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground cursor-pointer focus-visible:ring-ring/50 absolute inset-y-0 end-0 rounded-s-none hover:bg-transparent"
            onClick={onClear}
            tabIndex={onClear ? 0 : -1}
            disabled={disabled}
          >
            <X />
            <span className="sr-only">Press to empty the input </span>
          </Button>
        )}
      </div>
    </div>
  );
};
