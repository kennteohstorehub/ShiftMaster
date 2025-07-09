import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate initials from a name
 * - For multiple words: Take first letter of each word (e.g., "Ken Ng" -> "KN")
 * - For single word: Take first 2 letters (e.g., "Ken" -> "KE")
 */
export function generateInitials(name: string): string {
  if (!name) return "??";
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2 letters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words: take first letter of each word
    return words
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase();
  }
}
