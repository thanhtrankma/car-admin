/**
 * Formats image URL to use proxy in production
 * In production, URLs from image server (171.244.43.84:9000) are converted to use /images proxy
 * This hides the server IP address from being exposed in the frontend
 */
export const formatImageUrl = (url?: string): string => {
  if (!url) return ''

  // Trim whitespace
  const trimmedUrl = url.trim()
  const isProduction = typeof import.meta !== 'undefined' && import.meta.env?.PROD

  // Check if URL contains image server IP (171.244.43.84:9000)
  const containsImageServer = /171\.244\.43\.84:9000/i.test(trimmedUrl)

  // PRIORITY 1: In production, ALWAYS convert URLs containing image server IP to proxy
  if (isProduction && containsImageServer) {
    try {
      // If URL has full protocol (http://171.244.43.84:9000/...)
      if (/^https?:\/\//i.test(trimmedUrl)) {
        const urlObj = new URL(trimmedUrl)
        const path = urlObj.pathname + urlObj.search + urlObj.hash
        return `/images${path}`
      }
    } catch {
      // If URL parsing fails, try simple string replacement
      return trimmedUrl.replace(/^https?:\/\/171\.244\.43\.84:9000/i, '/images')
    }
  }

  // PRIORITY 2: In production, convert paths that look like image paths to use proxy
  // This handles cases where URL might be just a path like "/products/..."
  if (
    isProduction &&
    trimmedUrl.startsWith('/') &&
    !trimmedUrl.startsWith('/images') &&
    !trimmedUrl.startsWith('/api')
  ) {
    // Check if it looks like an image path
    if (/^\/(products|images|uploads)/i.test(trimmedUrl)) {
      return `/images${trimmedUrl}`
    }
  }

  // PRIORITY 3: In development, also convert image server URLs to use proxy (for consistency)
  if (!isProduction && containsImageServer) {
    try {
      if (/^https?:\/\//i.test(trimmedUrl)) {
        const urlObj = new URL(trimmedUrl)
        const path = urlObj.pathname + urlObj.search + urlObj.hash
        return `/images${path}`
      }
    } catch {
      return trimmedUrl.replace(/^https?:\/\/171\.244\.43\.84:9000/i, '/images')
    }
  }

  // PRIORITY 4: If URL already has protocol and doesn't contain image server IP, return as is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    try {
      const urlObj = new URL(trimmedUrl)
      return urlObj.toString()
    } catch {
      return trimmedUrl
    }
  }

  // PRIORITY 5: If starts with //, add http:
  if (trimmedUrl.startsWith('//')) {
    return `http:${trimmedUrl}`
  }

  // PRIORITY 6: If starts with /, it's already a relative path
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl
  }

  // PRIORITY 7: Otherwise, add http:// prefix
  return `http://${trimmedUrl}`
}
