
"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface SimpleMediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (file: File) => void;
    storeId?: string; // Optional, to match signature
}

export function SimpleMediaPicker({ isOpen, onClose, onSelect }: SimpleMediaPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            onSelect(file);
            onClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">رفع صورة</DialogTitle>
                </DialogHeader>
                <div
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">اضغط للرفع</span> أو اسحب وأفلت هنا
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIT up to 10MB</p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
