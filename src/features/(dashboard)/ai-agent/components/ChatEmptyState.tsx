// src/features/(dashboard)/ai-agent/components/ChatEmptyState.tsx
"use client";

export function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#F5F5F5] rounded-lg">
      {/* Robot Image Placeholder - Replace src with actual robot image from assets */}
      <div className="relative  h-56 mb-6">
         {/* Using a placeholder div to represent the robot in the image */}
         <img 
            src="/icons/dashboard/bot.svg" 
            alt="Robot" 
            className="w-full h-full object-contain"
            onError={(e) => {
                // Fallback if image missing
                e.currentTarget.style.display = 'none';
            }}
         />

      </div>
      
      <h3 className="text-xl font-medium ">
        حدد رسائل لعرضها
      </h3>
    </div>
  );
}