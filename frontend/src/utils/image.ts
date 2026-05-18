/**
 * Appends Cloudinary optimization parameters to the image URL if it's a Cloudinary link.
 * Parameters: f_auto (auto format), q_auto (auto quality), w_800 (width limit)
 */
export const optimizeImage = (url: string, width: number = 800): string => {
  if (!url) return "";

  if (url.includes("cloudinary.com")) {
    // Check if it already has transformations
    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
    }
  }

  return url;
};

/**
 * Gets the full image URL, handling both relative and absolute URLs
 * Also applies Cloudinary optimizations if applicable
 */
export const getImageUrl = (url: string, width: number = 800): string => {
  if (!url) return "";

  // If it's already a full URL, optimize and return
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return optimizeImage(url, width);
  }

  // If it's a relative URL, prepend the API base URL
  const apiUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:3000";
  return optimizeImage(`${apiUrl}${url}`, width);
};
