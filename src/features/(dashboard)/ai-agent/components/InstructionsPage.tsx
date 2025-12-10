// src/features/(dashboard)/ai-agent/components/InstructionsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { PlatformsSidebar } from "../components/PlatformsSidebar";
import { Button } from "@/src/components/ui/button";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { useGetInstruction, useUpdateInstruction } from "../hooks";
import { PlatformType } from "../api";

export function InstructionsPage() {
    const [activePlatform, setActivePlatform] = useState<string>("whatsapp");
    const [editorContent, setEditorContent] = useState("");
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const isSupportedPlatform = (platform: string): platform is PlatformType => {
        return ["whatsapp", "instagram", "messenger"].includes(platform);
    };

    const currentPlatform = isSupportedPlatform(activePlatform) ? activePlatform : null;

    const { data: instructionData, isLoading: isFetching } = useGetInstruction(
        currentPlatform as PlatformType
    );

    const { mutate: updateInstruction, isPending: isSaving } = useUpdateInstruction();

    useEffect(() => {
        if (instructionData?.system_message) {
            setEditorContent(instructionData.system_message);
        } else if (!isFetching) {
            setEditorContent("");
        }
    }, [instructionData, isFetching, activePlatform]);

    const handleSave = () => {
        if (currentPlatform) {
            updateInstruction(
                {
                    platform: currentPlatform,
                    payload: {
                        mode: "replace",
                        system_message: editorContent,
                    },
                },
                {
                    onSuccess: () => {
                        setIsSuccessOpen(true);
                    },
                }
            );
        }
    };

    return (
        <div className="p-5" >
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                <div className="hidden lg:block shrink-0 sticky top-25">
                    <Mosa3edySidebar isCollapsed />
                </div>
                <div className="hidden lg:block shrink-0 sticky top-25">
                    <PlatformsSidebar
                        activePlatform={activePlatform}
                        onSelect={setActivePlatform}
                    />
                </div>

                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-8  h-[calc(100vh-124px)] flex flex-col">

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">التعليمات العامة</h1>
                            <p className="text-gray-2 text-sm">تعليمات عامة للروبوت، مثل كيفية الرد على المستخدمين والسلوك، وغير ذلك</p>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !currentPlatform || isFetching}
                            className="bg-blue-4  text-white px-10 h-12 rounded-full font-bold text-sm min-w-[100px] "
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
                        </Button>
                    </div>

                    <div className="w-full h-[1px] bg-gray-100 mb-4" />

                    <div className="flex-1 bg-white relative flex flex-col min-h-0 overflow-hidden">
                        {isFetching ? (
                            <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center min-h-[400px]">
                                <Loader2 className="w-8 h-8 text-[#3A5779] animate-spin" />
                            </div>
                        ) : null}

                        {!currentPlatform ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-2 border border-dashed border-gray-200 rounded-xl">
                                <p>هذه المنصة غير مدعومة حالياً  </p>
                            </div>
                        ) : (
                            <RichTextEditor
                                value={editorContent}
                                onChange={setEditorContent}
                                label=""
                                placeholder="اكتب التعليمات هنا..."
                                helpTooltip=""
                                className="h-full"
                            />
                        )}
                    </div>
                </div>
            </div>

            <SuccessModal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="تم الحفظ بنجاح"
                message="تم تحديث تعليمات المساعد الذكي لهذه المنصة بنجاح."
                buttonText="تم"
            />
        </div>
    );
}