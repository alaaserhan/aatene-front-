// src/features/(dashboard)/settings/components/RichTextEditor.tsx
"use client";

import { useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  isRtl?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "أضف وصف مميز...",
  minHeight = "200px",
  className,
  isRtl = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || undefined);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: "bold", title: "عريض" },
    { icon: Italic, command: "italic", title: "مائل" },
    { icon: Underline, command: "underline", title: "تحته خط" },
    { icon: Strikethrough, command: "strikeThrough", title: "يتوسطه خط" },
    { icon: LinkIcon, command: "createLink", title: "إضافة رابط" },
    { icon: List, command: "insertUnorderedList", title: "قائمة منقطة" },
    { icon: ListOrdered, command: "insertOrderedList", title: "قائمة مرقمة" },
  ];

  const handleLinkClick = () => {
    const url = prompt("أدخل رابط URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div
      className={cn(
        "border border-gray-300 rounded-lg overflow-hidden bg-white",
        className
      )}
    >
      {/* Editor - يظهر أولاً */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={cn(
            "p-4 focus:outline-none min-h-[200px]"
          )}
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value || "" }}
          suppressContentEditableWarning
        />

        {!value && (
          <div
            className={cn(
              "absolute top-4 text-gray-400 start-4 pointer-events-none"
            )}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Toolbar - يظهر في الأسفل */}
      <div className="flex items-center gap-1 p-2 border-t border-gray-200 bg-gray-50">
        {toolbarButtons.map((btn, index) => {
          const Icon = btn.icon;
          const isLink = btn.command === "createLink";

          return (
            <button
              key={index}
              type="button"
              onClick={() => (isLink ? handleLinkClick() : executeCommand(btn.command))}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={btn.title}
            >
              <Icon className="w-4 h-4 text-blue-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}