import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isVideoFile = (fileName: string) => {
    return /\.(mp4|webm|ogg|mov|mkv|av1|avi)$/i.test(fileName || "");
};
