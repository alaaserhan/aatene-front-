//src/features/(dashboard)/followings/components/FollowersEmptyState.tsx
"use client";

import { Users } from "lucide-react";

interface FollowersEmptyStateProps {
  message: string;
  description: string;
}

export function FollowersEmptyState({ message, description }: FollowersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg min-h-[400px]">
      <div className="relative mb-6">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center">
            <Users className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-blue-100 rounded-full p-2 border-4 border-white">
            <span className="text-blue-500 text-xl font-bold">+</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}