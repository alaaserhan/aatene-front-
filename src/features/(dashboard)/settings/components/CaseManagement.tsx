"use client";

import { Label } from "@/src/components/ui/label";

export interface CaseManagementData {
  isSiteUnderConstruction: boolean;
  isAppUnderConstruction: boolean;
  isAppNeedsUpdate: boolean;
}

interface CaseManagementProps {
  data: CaseManagementData;
  onChange: (data: Partial<CaseManagementData>) => void;
}

export function CaseManagement({ data, onChange }: CaseManagementProps) {
  return (
    <div className="space-y-8">
      {/* Platform Status */}
      <div className="space-y-4">
        <Label className="text-lg font-bold text-brand-black-1">حالة المنصة</Label>
        <div className="flex flex-col items-start gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isSiteUnderConstruction"
              checked={data.isSiteUnderConstruction === false}
              onChange={() => onChange({ isSiteUnderConstruction: false })}
              className="w-4 h-4 text-blue-3 accent-blue-3"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">نشط</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isSiteUnderConstruction"
              checked={data.isSiteUnderConstruction === true}
              onChange={() => onChange({ isSiteUnderConstruction: true })}
              className="w-4 h-4 text-blue-3 accent-blue-3"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">قيد التطوير</span>
          </label>
        </div>
      </div>

      {/* Application Status */}
      <div className="space-y-4">
        <Label className="text-lg font-bold text-brand-black-1">حالة التطبيق</Label>
        <div className="flex flex-col items-start gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isAppUnderConstruction"
              checked={data.isAppUnderConstruction === false}
              onChange={() => onChange({ isAppUnderConstruction: false })}
              className="w-4 h-4 text-blue-3 accent-blue-3"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">نشط</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isAppUnderConstruction"
              checked={data.isAppUnderConstruction === true}
              onChange={() => onChange({ isAppUnderConstruction: true })}
              className="w-4 h-4 text-blue-3 accent-blue-3"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">قيد التطوير</span>
          </label>
        </div>
      </div>

      {/* App Needs Update */}
      <div className="space-y-4">
        <Label className="text-lg font-bold text-brand-black-1">التطبيق يحتاج إلى تحديث</Label>
        <div className="flex flex-col items-start gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isAppNeedsUpdate"
              checked={data.isAppNeedsUpdate === true}
              onChange={() => onChange({ isAppNeedsUpdate: true })}
              className="w-4 h-4 text-blue-3 accent-blue-3"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">نعم</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isAppNeedsUpdate"
              checked={data.isAppNeedsUpdate === false}
              onChange={() => onChange({ isAppNeedsUpdate: false })}
              className="w-4 h-4 text-blue-3 accent-blue-3"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-3 transition-colors">لا</span>
          </label>
        </div>
      </div>
    </div>
  );
}