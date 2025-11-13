// src/components/ui/SimpleMultiSelect.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Checkbox } from "@/src/components/ui/checkbox";

interface Option {
  label: string;
  value: string;
}

interface SimpleMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "اختر...",
  className,
}: SimpleMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggleOption = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    const newValue = isSelected
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = value
    .map((val) => options.find((o) => o.value === val)?.label)
    .filter(Boolean) as string[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 px-3 font-normal",
            !value.length && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedLabels.length > 0
              ? selectedLabels.join(", ")
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-gray-1 p-0">
        <div className="p-2 space-y-1">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
              onClick={() => handleToggleOption(option.value)}
            >
              <Checkbox
                id={`ms-cb-${option.value}`}
                checked={value.includes(option.value)}
                onCheckedChange={() => handleToggleOption(option.value)}
                className="bg-blue-4 border-none"
              />
              <label
                htmlFor={`ms-cb-${option.value}`}
                className="text-sm font-medium leading-none cursor-pointer text-blue-3"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}