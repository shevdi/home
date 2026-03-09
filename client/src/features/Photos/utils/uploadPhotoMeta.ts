import exifr from 'exifr'

export type FileMeta = {
  name: string
  size: number
  type: string
  lastModified: number
  width?: number
  height?: number
  make?: string
  model?: string
  takenAt?: string
  gps?: {
    lat: number
    lon: number
    alt?: number
  }
}

export const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${sizes[index]}`
}

export const formatGps = (gps?: FileMeta['gps']) => {
  if (!gps) return ''
  const lat = Number.isFinite(gps.lat) ? gps.lat.toFixed(6) : ''
  const lon = Number.isFinite(gps.lon) ? gps.lon.toFixed(6) : ''
  if (!lat || !lon) return ''
  return `${lat}, ${lon}${Number.isFinite(gps.alt) ? ` · ${gps.alt}m` : ''}`
}

const DATE_LOCALE = 'ru-RU'
const DATE_TIMEZONE = 'Europe/Moscow'

export const formatDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: DATE_TIMEZONE,
  }).format(date)
}

export const getImageDimensions = (file: File) =>
  new Promise<{ width: number; height: number } | undefined>((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined)
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const result = { width: img.width, height: img.height }
      URL.revokeObjectURL(url)
      resolve(result)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(undefined)
    }
    img.src = url
  })

export const getExifMeta = async (file: File) => {
  if (!file.type.startsWith('image/')) return {}
  try {
    const [gps, exif] = await Promise.all([exifr.gps(file).catch(() => null), exifr.parse(file, true).catch(() => null)])

    const safeExif = (exif || {}) as Record<string, unknown>
    const make = typeof safeExif.Make === 'string' ? safeExif.Make : undefined
    const model = typeof safeExif.Model === 'string' ? safeExif.Model : undefined
    const takenAtValue = safeExif.DateTimeOriginal || safeExif.CreateDate || safeExif.ModifyDate
    const takenAt =
      takenAtValue instanceof Date ? takenAtValue.toISOString() : typeof takenAtValue === 'string' ? takenAtValue : undefined

    const safeGps = (gps || {}) as { latitude?: number; longitude?: number; altitude?: number }
    const lat = typeof safeGps.latitude === 'number' ? safeGps.latitude : undefined
    const lon = typeof safeGps.longitude === 'number' ? safeGps.longitude : undefined
    const alt = typeof safeGps.altitude === 'number' ? safeGps.altitude : undefined

    return {
      make,
      model,
      takenAt,
      gps: lat !== undefined && lon !== undefined ? { lat, lon, alt } : undefined,
    }
  } catch {
    return {}
  }
}

export const buildMeta = async (selected: File[]) => {
  const baseMeta: FileMeta[] = selected.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type || 'unknown',
    lastModified: file.lastModified,
  }))

  const [dimensions, exifMeta] = await Promise.all([
    Promise.all(selected.map((file) => getImageDimensions(file))),
    Promise.all(selected.map((file) => getExifMeta(file))),
  ])
  return baseMeta.map((meta, index) => ({
    ...meta,
    width: dimensions[index]?.width,
    height: dimensions[index]?.height,
    ...exifMeta[index],
  }))
}
