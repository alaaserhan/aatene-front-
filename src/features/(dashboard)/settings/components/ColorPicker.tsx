"use client";

import { useState, useRef } from "react";
import { Edit } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    colorInputRef.current?.click();
  };

  const presetColors = [
    "#2D496A", // brand-blue-3
    "#38587A", // brand-blue-2
    "#C8D7E8", // brand-blue-1
    "#9291A5", // brand-gray-1
    "#202020", // brand-black-1
    "#F5F5F5", // brand-white-1
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-brand-black-1 text-right">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Color Display */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleClick}
          type="button"
          className="relative w-24 h-24 rounded-lg border-2 border-gray-300 hover:border-brand-blue-2 transition-colors overflow-hidden group"
          style={{ backgroundColor: value }}
        >
          {/* Edit Icon Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Edit className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Preset Colors */}
        <div className="flex-1 grid grid-cols-6 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                "w-10 h-10 rounded-lg border-2 transition-all hover:scale-110",
                value === color ? "border-brand-blue-3 ring-2 ring-brand-blue-2" : "border-gray-300"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Hidden Color Input */}
      <input
        ref={colorInputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="hidden"
      />

      {/* Color Value Display */}
      <p className="text-xs text-gray-500 text-right">
        اللون المختار: <span className="font-mono font-medium">{value}</span>
      </p>
    </div>
  );
}