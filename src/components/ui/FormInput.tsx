"use client";

import React, { useState } from "react";
import { useFormContext, Control } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";

// ⭐️ (1) Use React.ComponentProps instead of InputProps
interface FormInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  name: string;
  label?: string;
  description?: string;
  control?: Control;
  // ⭐️ (2) Add "tel" to the list of allowed types
  type?: "text" | "email" | "password" | "number" | "tel";
}

export function FormInput({
  name,
  label,
  description,
  control,
  type = "text",
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useFormContext();

  const effectiveControl = control || form?.control;

  if (!effectiveControl) {
    throw new Error(
      "FormInput must be used within a Form provider or have a control prop"
    );
  }

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <FormField
      control={effectiveControl}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                type={inputType}
                {...props}
                {...field}
              />
              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}