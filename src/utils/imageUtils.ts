/**
 * Image base URL - similar to API_BASE_URL in apiClient.ts
 * In production, use proxy path /images
 * In development, can use proxy or direct URL
 */
const IMAGE_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_BASE_URL) ||
  (import.meta.env.PROD ? '/images' : '/images')

/**
 * Formats image URL to use proxy, similar to how apiClient.ts handles API URLs
 * Replaces server IP URL with domain proxy path
 */
export const formatImageUrl = (url?: string): string => {
  if (!url) return ''

  // Trim whitespace
  const trimmedUrl = url.trim()

  // Check if URL contains image server IP (171.244.43.84:9000)
  const containsImageServer = /171\.244\.43\.84:9000/i.test(trimmedUrl)

  // If URL contains image server IP, replace it with proxy path
  if (containsImageServer) {
    try {
      // If URL has full protocol (http://171.244.43.84:9000/...)
      if (/^https?:\/\//i.test(trimmedUrl)) {
        const urlObj = new URL(trimmedUrl)
        const path = urlObj.pathname + urlObj.search + urlObj.hash
        // Replace with proxy path (similar to how API uses /api)
        return `${IMAGE_BASE_URL}${path}`
      }
    } catch {
      // If URL parsing fails, try simple string replacement
      return trimmedUrl.replace(/^https?:\/\/171\.244\.43\.84:9000/i, IMAGE_BASE_URL)
    }
  }

  // If URL is already a relative path starting with /, check if it needs proxy prefix
  if (
    trimmedUrl.startsWith('/') &&
    !trimmedUrl.startsWith('/images') &&
    !trimmedUrl.startsWith('/api')
  ) {
    // If it looks like an image path from server, add proxy prefix
    if (/^\/(products|images|uploads)/i.test(trimmedUrl)) {
      return `${IMAGE_BASE_URL}${trimmedUrl}`
    }
  }

  // If URL already has protocol and doesn't contain image server IP, return as is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    try {
      const urlObj = new URL(trimmedUrl)
      return urlObj.toString()
    } catch {
      return trimmedUrl
    }
  }

  // If starts with //, add http:
  if (trimmedUrl.startsWith('//')) {
    return `http:${trimmedUrl}`
  }

  // If starts with /, it's already a relative path
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl
  }

  // Otherwise, add http:// prefix
  return `http://${trimmedUrl}`
}
