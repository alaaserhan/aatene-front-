"use client";

import { Label } from "@/src/components/ui/label";

export interface ChatBotData {
  isChatBotAllowed: boolean;
}

interface ChatBotSectionProps {
  data: ChatBotData;
  onChange: (data: Partial<ChatBotData>) => void;
}

export function ChatBotSection({ data, onChange }: ChatBotSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-bold text-brand-black-1">
        المساعد الذكي (الشات بوت)
      </Label>
      <p className="text-sm text-gray-2">
        عند التعطيل، لن تظهر أيقونة المساعد الذكي للمستخدمين في أي صفحة.
      </p>
      <div className="flex flex-col items-start gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="isChatBotAllowed"
            checked={data.isChatBotAllowed === true}
            onChange={() => onChange({ isChatBotAllowed: true })}
            className="w-4 h-4 text-blue-3 accent-blue-3"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">
            مفعل
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="isChatBotAllowed"
            checked={data.isChatBotAllowed === false}
            onChange={() => onChange({ isChatBotAllowed: false })}
            className="w-4 h-4 text-blue-3 accent-blue-3"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">
            معطل
          </span>
        </label>
      </div>
    </div>
  );
}
