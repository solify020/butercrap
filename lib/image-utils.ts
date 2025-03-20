/**
 * Utility functions for image handling
 */

/**
 * List of domains known to implement anti-hotlinking measures
 */
const HOTLINK_PROTECTED_DOMAINS = [
  "pngwing.com",
  "freepik.com",
  "shutterstock.com",
  "gettyimages.com",
  "istockphoto.com",
  "alamy.com",
  "dreamstime.com",
  "pngegg.com",
  "pngitem.com",
  "pngall.com",
  "pngmart.com",
  "pngfind.com",
  "pngkey.com",
  "pngaaa.com",
  "pngfly.com",
  "pngimg.com",
  "pngwave.com",
  "pngwing.com",
  "pngfuel.com",
  "pngset.com",
  "pngarts.com",
  "pngbarn.com",
  "pnghost.com",
  "pngkit.com",
  "pngocean.com",
  "pngriver.com",
  "pngspot.com",
  "pngtree.com",
  "pngweb.com",
  "pngwing.com",
  "pngx.com",
  "pngyellow.com",
  "pngzone.com",
]

/**
 * Checks if a URL is from a domain known to implement anti-hotlinking
 * @param url The URL to check
 * @returns Boolean indicating if the URL is likely to be hotlink-protected
 */
export function isLikelyHotlinkProtected(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.toLowerCase()

    return HOTLINK_PROTECTED_DOMAINS.some(
      (protectedDomain) => domain === protectedDomain || domain.endsWith(`.${protectedDomain}`),
    )
  } catch (e) {
    // If URL parsing fails, return false
    return false
  }
}

/**
 * Validates if a URL is likely to be an image URL
 * @param url The URL to validate
 * @returns Boolean indicating if the URL is likely an image
 */
export function isImageUrl(url: string): boolean {
  // Check if URL ends with common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i
  if (imageExtensions.test(url)) {
    return true
  }

  // Check if URL contains image-related keywords
  const imageKeywords = /(image|photo|picture|img|cdn|media)/i
  if (imageKeywords.test(url)) {
    return true
  }

  return false
}

/**
 * Checks if an image URL is valid by attempting to load it
 * @param url The image URL to check
 * @returns Promise that resolves to boolean indicating if image loaded successfully
 */
export function checkImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    // First check if the URL is from a known hotlink-protected domain
    if (isLikelyHotlinkProtected(url)) {
      console.warn(`URL is likely hotlink-protected: ${url}`)
      // We still try to load it, but with a warning
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log(`Image loaded successfully: ${url}`)
      resolve(true)
    }

    img.onerror = () => {
      console.error(`Failed to load image: ${url}`)
      resolve(false)
    }

    // Add a random query parameter to bypass cache
    const cacheBuster = `?cb=${Date.now()}`
    img.src = url.includes("?") ? `${url}&cb=${Date.now()}` : `${url}${cacheBuster}`

    // Set a timeout in case the image takes too long to load
    setTimeout(() => {
      if (!img.complete) {
        console.warn(`Image load timed out: ${url}`)
        resolve(false)
      }
    }, 10000) // 10 second timeout
  })
}

/**
 * Logs information about an image URL for debugging
 * @param url The image URL to debug
 */
export function debugImageUrl(url: string): void {
  console.group(`Image Debug: ${url}`)
  console.log(`URL: ${url}`)
  console.log(`Appears to be an image URL: ${isImageUrl(url)}`)
  console.log(`Likely hotlink-protected: ${isLikelyHotlinkProtected(url)}`)

  // Check if URL is absolute
  try {
    const urlObj = new URL(url)
    console.log(`Protocol: ${urlObj.protocol}`)
    console.log(`Host: ${urlObj.host}`)
    console.log(`Path: ${urlObj.pathname}`)
    console.log(`Query: ${urlObj.search}`)
  } catch (e) {
    console.error(`Not a valid absolute URL: ${e.message}`)
  }

  // Try to load the image
  checkImageUrl(url).then((success) => {
    console.log(`Load test result: ${success ? "Success" : "Failed"}`)
    console.groupEnd()
  })
}

