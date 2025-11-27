// src/features/(dashboard)/settings/components/RichTextToolbar.tsx
"use client";

import { useState } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
} from "lucide-react";
import { Toggle } from "@/src/components/ui/toggle";
import { Button } from "@/src/components/ui/button";
import { AddLinkDialog } from "./AddLinkDialog";

interface RichTextToolbarProps {
  editor: Editor | null;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ text: "", url: "" });

  if (!editor) {
    return null;
  }

  const openLinkDialog = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    const currentUrl = editor.getAttributes("link").href || "";

    setDialogData({
      text: selectedText,
      url: currentUrl,
    });
    setIsLinkDialogOpen(true);
  };

  const handleSaveLink = (text: string, url: string) => {
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (text !== dialogData.text) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .insertContent({
          type: "text",
          text: text,
          marks: [
            {
              type: "link",
              attrs: {
                href: url,
              },
            },
          ],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 p-2 border-t border-gray-200 bg-gray-50">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </Toggle>

        <Button
          variant="ghost"
          size="sm"
          onClick={openLinkDialog}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Toggle>
      </div>

      <AddLinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        initialText={dialogData.text}
        initialUrl={dialogData.url}
        onSave={handleSaveLink}
      />
    </>
  );
}