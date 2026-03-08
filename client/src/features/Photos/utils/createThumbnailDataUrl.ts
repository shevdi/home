const THUMB_SIZE = 48

/**
 * Creates a small data URL thumbnail from a File for persistence in Redux.
 * Used when user may navigate away - File objects are lost but data URL persists.
 */
export async function createThumbnailDataUrl(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return undefined
  if (typeof URL.createObjectURL !== 'function') return undefined

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = THUMB_SIZE
        canvas.height = THUMB_SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(undefined)
          return
        }
        ctx.drawImage(img, 0, 0, THUMB_SIZE, THUMB_SIZE)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      } catch {
        resolve(undefined)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(undefined)
    }
    img.src = url
  })
}
