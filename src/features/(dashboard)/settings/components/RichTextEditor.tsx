// src/features/(dashboard)/settings/components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/src/lib/utils";
import { RichTextToolbar } from "./RichTextToolbar";
import { useEffect } from "react";

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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "p-4 focus:outline-none",
          "prose prose-sm max-w-none"
        ),
        style: `min-height: ${minHeight};`,
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            ...editor.options.editorProps.attributes,
            dir: isRtl ? "rtl" : "ltr",
          },
        },
      });
    }
  }, [isRtl, editor]);

 useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);
  
  return (
    <div
      className={cn(
        "border border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col",
        className
      )}
    >
      <EditorContent editor={editor} className="flex-1" />
      <RichTextToolbar editor={editor} />
    </div>
  );
}