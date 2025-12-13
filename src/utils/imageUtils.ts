/**
 * Formats image URL to use proxy in production
 * In production, URLs from image server (171.244.43.84:9000) are converted to use /images proxy
 */
export const formatImageUrl = (url?: string): string => {
  if (!url) return ''

  // Trim whitespace
  const trimmedUrl = url.trim()

  // Check if URL is from image server (171.244.43.84:9000)
  const imageServerPattern = /^https?:\/\/171\.244\.43\.84:9000\//
  const isProduction = typeof import.meta !== 'undefined' && import.meta.env?.PROD

  // If URL is from image server and in production, use proxy
  if (isProduction && imageServerPattern.test(trimmedUrl)) {
    try {
      const urlObj = new URL(trimmedUrl)
      // Extract path after domain (e.g., /products/...)
      const path = urlObj.pathname + urlObj.search + urlObj.hash
      // Use proxy path
      return `/images${path}`
    } catch {
      // If URL parsing fails, try simple string replacement
      return trimmedUrl.replace(/^https?:\/\/171\.244\.43\.84:9000/, '/images')
    }
  }

  // If already has protocol, return as is (but ensure proper encoding)
  if (/^https?:\/\//i.test(trimmedUrl)) {
    try {
      // Try to parse and reconstruct URL to ensure proper encoding
      const urlObj = new URL(trimmedUrl)
      return urlObj.toString()
    } catch {
      // If URL parsing fails, return as is
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

