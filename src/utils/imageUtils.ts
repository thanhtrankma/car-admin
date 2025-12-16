export const formatImageUrl = (url?: string): string => {
  if (!url) return ''

  if (/^https?:\/\//i.test(url)) {
    const imageServerPattern = /^https?:\/\/171\.244\.43\.84:9000\/(.+)$/i
    const match = url.match(imageServerPattern)

    if (match) {
      return `/images/${match[1]}`
    }

    if (url.startsWith('https://')) {
      return url
    }

    if (
      url.startsWith('http://') &&
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:'
    ) {
      return url.replace('http://', 'https://')
    }

    return url
  }

  const imageServerPatternNoProtocol = /^171\.244\.43\.84:9000\/(.+)$/i
  const matchNoProtocol = url.match(imageServerPatternNoProtocol)

  if (matchNoProtocol) {
    return `/images/${matchNoProtocol[1]}`
  }

  if (url.startsWith('/images/')) {
    const incorrectPattern = /^\/images\/171\.244\.43\.84:9000\/(.+)$/i
    const incorrectMatch = url.match(incorrectPattern)
    if (incorrectMatch) {
      return `/images/${incorrectMatch[1]}`
    }
    return url
  }

  if (url.startsWith('/')) {
    return url
  }

  return `/images/${url}`
}
