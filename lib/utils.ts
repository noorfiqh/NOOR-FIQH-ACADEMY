import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Handle Google Drive links: /file/d/ID/view, /open?id=ID, /uc?id=ID
  const gdriveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed;
}
