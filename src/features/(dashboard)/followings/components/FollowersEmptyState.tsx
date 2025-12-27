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
      <div className="relative ">
        <div className="flex items-center justify-center">
          <img src="/icons/dashboard/emptyFollowing.svg" className="w-48" alt="" />
        </div>
      </div>

      <h3 className="text-xl font-medium  mb-2">{message}</h3>
      <p className="text-gray-3 text-sm">{description}</p>
    </div>
  );
}