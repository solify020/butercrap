/**
 * Utility functions for image resizing
 */

/**
 * Resizes an image file to fit within specified dimensions while maintaining aspect ratio
 * @param file The image file to resize
 * @param maxWidth Maximum width of the resized image
 * @param maxHeight Maximum height of the resized image
 * @param quality JPEG quality (0-1) for the output image
 * @returns Promise resolving to a new File object with the resized image
 */
export async function resizeImage(file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader()

    // Set up the FileReader onload event
    reader.onload = (readerEvent) => {
      // Create an image object
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Create a canvas and resize the image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Get the data URL from the canvas
        const format = file.type === "image/png" ? "image/png" : "image/jpeg"
        const dataUrl = canvas.toDataURL(format, quality)

        // Convert data URL to Blob
        const binaryString = atob(dataUrl.split(",")[1])
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: format })

        // Create a new File from the Blob
        const resizedFile = new File([blob], file.name, {
          type: format,
          lastModified: new Date().getTime(),
        })

        resolve(resizedFile)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      // Set the image source to the FileReader result
      if (typeof readerEvent.target?.result === "string") {
        img.src = readerEvent.target.result
      } else {
        reject(new Error("FileReader did not return a string"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    // Read the file as a data URL
    reader.readAsDataURL(file)
  })
}

