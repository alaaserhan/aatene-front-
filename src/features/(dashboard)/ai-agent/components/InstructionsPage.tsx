// src/features/(dashboard)/ai-agent/pages/InstructionsPage.tsx
"use client";

import { useState } from "react";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { PlatformsSidebar } from "../components/PlatformsSidebar";
import { Button } from "@/src/components/ui/button";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";

export function InstructionsPage() {
    const [activePlatform, setActivePlatform] = useState("website");
    const [editorContent, setEditorContent] = useState(`
    <h3 style="text-align: center;">Platform "أعطيني" Customer Support Assistant Instructions for</h3>
    <p style="text-align: center;"><strong>Role & Identity</strong></p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  `);

    const handleSave = () => {
        console.log("Saving content for:", activePlatform, editorContent);
    };

    return (
        <div className=" p-6" >
            <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* 1. Main Application Sidebar (Rightmost) */}
                <div className="hidden lg:block shrink-0 sticky top-6">
                    <Mosa3edySidebar isCollapsed />
                </div>

                {/* 2. Platforms Sidebar (Middle) */}
                <PlatformsSidebar
                    activePlatform={activePlatform}
                    onSelect={setActivePlatform}
                />

                {/* 3. Main Content Area (Leftmost) */}
                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col">

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                        {/* Title & Description */}
                        <div>
                            <h1 className="text-2xl font-bold mb-2">التعليمات العامة</h1>
                            <p className="text-gray-2 text-sm">تعليمات عامة للروبوت، مثل كيفية الرد على المستخدمين والسلوك، وغير ذلك</p>
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={handleSave}
                            className="bg-blue-4 hover:bg-[#2c4460] text-white px-10 h-12 rounded-full font-bold text-sm "
                        >
                            حفظ
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1px] bg-gray-100 mb-4" />

                    {/* Editor Area */}
                    <div className="flex-1">
                        <RichTextEditor
                            value={editorContent}
                            onChange={setEditorContent}
                            label=""
                            placeholder="اكتب التعليمات هنا..."
                            rows={15}
                            helpTooltip=""
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}