"use client";

import { Button } from "@/src/components/ui/button";

interface KnowledgeBaseEmptyStateProps {
  onAddClick: () => void;
}

export function KnowledgeBaseEmptyState({ onAddClick }: KnowledgeBaseEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl h-[600px]">
      {/* Empty State Illustration or Placeholder */}
      {/* Since no specific icon was provided in the image other than text, we center the text layout */}
      
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-900">لا يوجد وثائق</h3>
        <p className="text-gray-500 text-sm">أضغط علي إضافة الوثائق</p>
        
        <Button 
          onClick={onAddClick}
          className="mt-4 px-8 py-6 bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-lg font-bold text-base"
        >
          إضافة الوثائق
        </Button>
      </div>
    </div>
  );
}