import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractGoogleDriveId(url?: string): string | null {
  if (!url) return null;
  let trimmed = url.trim();
  if (!trimmed) return null;

  // Remove surrounding quotes or angles if pasted with them
  trimmed = trimmed.replace(/^["'<]|["'>]$/g, '').trim();

  // If already pure alphanumeric ID with standard Drive ID length
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed) && !trimmed.includes('.') && !trimmed.includes('/')) {
    return trimmed;
  }

  // Regex patterns covering all Google Drive link variations
  const patterns = [
    /\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/i,
    /\/d\/([a-zA-Z0-9_-]+)/i,
    /[?&]id=([a-zA-Z0-9_-]+)/i,
    /\/folders\/([a-zA-Z0-9_-]+)/i,
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i,
    /\/open\?id=([a-zA-Z0-9_-]+)/i,
    /\/uc\?(?:[^&]+&)*id=([a-zA-Z0-9_-]+)/i,
    /\/preview\?id=([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length >= 15) {
      return match[1];
    }
  }

  return null;
}

export function formatImageUrl(url?: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  // Remove surrounding quotes
  trimmed = trimmed.replace(/^["']|["']$/g, '');

  // Data URLs or blobs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Handle Google Drive links & IDs
  const gdriveId = extractGoogleDriveId(trimmed);
  if (gdriveId) {
    // Google User Content CDN link with high-resolution parameter
    return `https://lh3.googleusercontent.com/d/${gdriveId}`;
  }

  // Dropbox links: replace dl=0 with raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }

  // GitHub blob to raw
  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  return trimmed;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl?: string) {
  try {
    e.stopPropagation();
    e.preventDefault();
  } catch {
    // Ignore synthetic event errors
  }

  const target = e.currentTarget;
  if (!target) return;

  // Prevent infinite loops if fallback fails
  if (target.dataset.fallbackApplied === 'true') {
    return;
  }

  const currentSrc = target.src || '';
  const gdriveId = extractGoogleDriveId(originalUrl || currentSrc);

  if (gdriveId) {
    if (currentSrc.includes('lh3.googleusercontent.com')) {
      // Fallback 1: Google Drive thumbnail endpoint
      target.src = `https://drive.google.com/thumbnail?id=${gdriveId}&sz=w1920`;
      return;
    } else if (currentSrc.includes('drive.google.com/thumbnail')) {
      // Fallback 2: Google Drive uc export endpoint
      target.src = `https://drive.google.com/uc?export=view&id=${gdriveId}`;
      return;
    }
  }

  // Set fallback flag and apply clean neutral placeholder SVG
  target.dataset.fallbackApplied = 'true';
  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f1f5f9" width="100" height="100"/><text fill="%2394a3b8" x="50" y="55" font-family="sans-serif" font-size="12" text-anchor="middle">No Image</text></svg>';
}
