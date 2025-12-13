/**
 * Format image URL to use proxy path for Vercel deployment
 * Converts server URLs like http://171.244.43.84:9000/products/... to /images/products/...
 * This allows images to be served through Vercel proxy with HTTPS support
 */
export const formatImageUrl = (url?: string): string => {
  if (!url) return ''

  // If URL already has protocol, check if it's from the image server
  if (/^https?:\/\//i.test(url)) {
    // Check if it's from the image server (171.244.43.84:9000)
    const imageServerPattern = /^https?:\/\/171\.244\.43\.84:9000\/(.+)$/i
    const match = url.match(imageServerPattern)

    if (match) {
      // Convert to proxy path: /images/{rest of path}
      return `/images/${match[1]}`
    }

    // If it's already a valid HTTPS URL from another source, return as is
    if (url.startsWith('https://')) {
      return url
    }

    // If it's HTTP from another source, try to convert to HTTPS if on HTTPS page
    if (
      url.startsWith('http://') &&
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:'
    ) {
      return url.replace('http://', 'https://')
    }

    return url
  }

  // If URL doesn't have protocol, check if it's already a proxy path
  if (url.startsWith('/images/')) {
    return url
  }

  // If it's a relative path starting with /, return as is
  if (url.startsWith('/')) {
    return url
  }

  // Otherwise, assume it's a path that should go through proxy
  return `/images/${url}`
}
