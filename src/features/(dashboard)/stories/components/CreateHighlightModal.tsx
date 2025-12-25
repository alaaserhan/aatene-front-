// src/features/(dashboard)/stories/components/CreateHighlightModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useCreateHighlight } from "../hooks";
import { Story } from "../api";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface CreateHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number;
  availableStories: Story[];
}

export function CreateHighlightModal({ isOpen, onClose, storeId, availableStories }: CreateHighlightModalProps) {
  const [name, setName] = useState("");
  const [selectedStories, setSelectedStories] = useState<number[]>([]);
  
  const { mutate: createHighlight, isPending } = useCreateHighlight();

  const toggleStory = (id: number) => {
    setSelectedStories(prev => 
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
        toast.error("يرجى كتابة اسم المجموعة");
        return;
    }
    if (selectedStories.length === 0) {
        toast.error("يرجى اختيار قصة واحدة على الأقل");
        return;
    }

    createHighlight({
        payload: { name, stories: selectedStories },
        storeId: String(storeId)
    }, {
        onSuccess: () => {
            onClose();
            setName("");
            setSelectedStories([]);
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl bg-white" dir="rtl">
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 text-right">انشاء مجموعة جديدة</h3>
            
            <Input 
                placeholder="اسم المجموعة" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-right border-gray-200"
            />

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block text-right">اختر القصص</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
                    {availableStories.map((story) => (
                        <div 
                            key={story.id} 
                            onClick={() => toggleStory(story.id)}
                            className={cn(
                                "aspect-[9/16] rounded-xl relative cursor-pointer overflow-hidden border-2 transition-all",
                                selectedStories.includes(story.id) ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent"
                            )}
                        >
                            {/* عرض المحتوى (صورة أو نص ملون) */}
                            {story.image ? (
                                <img src={story.image} className="w-full h-full object-cover" alt="story" />
                            ) : (
                                <div 
                                    className="w-full h-full flex items-center justify-center p-2 text-center text-white text-xs font-bold break-words"
                                    style={{ backgroundColor: story.color || "#333" }}
                                >
                                    {story.text}
                                </div>
                            )}

                            {/* أيقونة الاختيار */}
                            <div className={cn(
                                "absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-colors",
                                selectedStories.includes(story.id) ? "bg-blue-500" : "bg-black/30"
                            )}>
                                {selectedStories.includes(story.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button className="flex-1 bg-[#3A5779]" onClick={handleSubmit} disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : "نشر"}
                </Button>
                <Button variant="secondary" className="flex-1 bg-gray-100" onClick={onClose}>
                    الغاء
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}