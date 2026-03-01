import {
  formatBytes,
  formatGps,
  formatDate,
  getImageDimensions,
  getExifMeta,
  buildMeta,
} from '../uploadPhotoMeta'

jest.mock('exifr', () => ({
  gps: jest.fn(),
  parse: jest.fn(),
}))

import exifr from 'exifr'

const mockExifrGps = exifr.gps as jest.Mock
const mockExifrParse = exifr.parse as jest.Mock

describe('formatBytes', () => {
  it('returns "0 B" when bytes is 0', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('returns "0 B" when bytes is falsy', () => {
    expect(formatBytes(undefined as unknown as number)).toBe('0 B')
  })

  it('formats bytes in B', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats bytes in KB with one decimal when value < 10', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats bytes in KB with no decimal when value >= 10', () => {
    expect(formatBytes(20480)).toBe('20 KB')
  })

  it('formats bytes in MB', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('formats bytes in GB', () => {
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe('3.0 GB')
  })
})

describe('formatGps', () => {
  it('returns empty string when gps is undefined', () => {
    expect(formatGps(undefined)).toBe('')
  })

  it('returns empty string when lat is not finite', () => {
    expect(formatGps({ lat: NaN, lon: 0 })).toBe('')
  })

  it('returns empty string when lon is not finite', () => {
    expect(formatGps({ lat: 0, lon: Infinity })).toBe('')
  })

  it('returns lat, lon when both are valid', () => {
    expect(formatGps({ lat: 55.7558, lon: 37.6173 })).toBe('55.755800, 37.617300')
  })

  it('includes altitude when alt is finite', () => {
    expect(formatGps({ lat: 0, lon: 0, alt: 120 })).toBe('0.000000, 0.000000 · 120m')
  })

  it('omits altitude when alt is not finite', () => {
    expect(formatGps({ lat: 0, lon: 0, alt: NaN })).toBe('0.000000, 0.000000')
  })
})

describe('formatDate', () => {
  it('returns empty string when value is undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('returns empty string when value is empty string', () => {
    expect(formatDate('')).toBe('')
  })

  it('returns value as-is when date is invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('returns localized string for valid ISO date', () => {
    const result = formatDate('2020-01-15T12:00:00Z')
    expect(result).toEqual('15.01.2020, 15:00:00')
  })
})

describe('getImageDimensions', () => {
  const createObjectURL = URL.createObjectURL
  const revokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('returns undefined for non-image file', async () => {
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
    const result = await getImageDimensions(file)
    expect(result).toBeUndefined()
  })

  it('returns dimensions when image loads successfully', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const mockImg = {
      width: 800,
      height: 600,
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }

    const ImageMock = jest.fn(() => {
      const img = mockImg
      queueMicrotask(() => img.onload?.())
      return img
    })
    global.Image = ImageMock as unknown as typeof Image

    const result = await getImageDimensions(file)

    expect(result).toEqual({ width: 800, height: 600 })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('returns undefined when image fails to load', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const mockImg = {
      width: 0,
      height: 0,
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }

    const ImageMock = jest.fn(() => {
      const img = mockImg
      queueMicrotask(() => img.onerror?.())
      return img
    })
    global.Image = ImageMock as unknown as typeof Image

    const result = await getImageDimensions(file)

    expect(result).toBeUndefined()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})

describe('getExifMeta', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty object for non-image file', async () => {
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
    const result = await getExifMeta(file)
    expect(result).toEqual({})
    expect(mockExifrGps).not.toHaveBeenCalled()
    expect(mockExifrParse).not.toHaveBeenCalled()
  })

  it('returns make, model, takenAt from exif', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    mockExifrGps.mockResolvedValue(null)
    mockExifrParse.mockResolvedValue({
      Make: 'Canon',
      Model: 'EOS M50',
      DateTimeOriginal: new Date('2020-01-15T12:00:00Z'),
    })

    const result = await getExifMeta(file)

    expect(result).toEqual({
      make: 'Canon',
      model: 'EOS M50',
      takenAt: '2020-01-15T12:00:00.000Z',
      gps: undefined,
    })
  })

  it('uses CreateDate when DateTimeOriginal is missing', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    mockExifrGps.mockResolvedValue(null)
    mockExifrParse.mockResolvedValue({
      CreateDate: '2020:01:15 12:00:00',
    })

    const result = await getExifMeta(file)

    expect(result.takenAt).toBe('2020:01:15 12:00:00')
  })

  it('returns gps when lat and lon are present', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    mockExifrGps.mockResolvedValue({
      latitude: 55.75,
      longitude: 37.61,
      altitude: 120,
    })
    mockExifrParse.mockResolvedValue({})

    const result = await getExifMeta(file)

    expect(result.gps).toEqual({ lat: 55.75, lon: 37.61, alt: 120 })
  })

  it('omits gps when only lat or lon is present', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    mockExifrGps.mockResolvedValue({ latitude: 55.75 })
    mockExifrParse.mockResolvedValue({})

    const result = await getExifMeta(file)

    expect(result.gps).toBeUndefined()
  })

  it('returns empty object when exifr throws', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    mockExifrGps.mockRejectedValue(new Error('exif parse failed'))
    mockExifrParse.mockRejectedValue(new Error('exif parse failed'))

    const result = await getExifMeta(file)

    expect(result).toEqual({})
  })
})

describe('buildMeta', () => {
  const createObjectURL = URL.createObjectURL
  const revokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    jest.clearAllMocks()
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('returns base meta with file info for each file', async () => {
    const file1 = new File(['a'], 'a.jpg', { type: 'image/jpeg' })
    const file2 = new File(['bb'], 'b.png', { type: 'image/png' })

    mockExifrGps.mockResolvedValue(null)
    mockExifrParse.mockResolvedValue({})

    const mockImg = {
      width: 100,
      height: 200,
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    global.Image = jest.fn(() => {
      const img = { ...mockImg }
      queueMicrotask(() => img.onload?.())
      return img
    }) as unknown as typeof Image

    const result = await buildMeta([file1, file2])

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      name: 'a.jpg',
      size: 1,
      type: 'image/jpeg',
      width: 100,
      height: 200,
    })
    expect(result[1]).toMatchObject({
      name: 'b.png',
      size: 2,
      type: 'image/png',
      width: 100,
      height: 200,
    })
  })

  it('merges exif meta into result', async () => {
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    mockExifrGps.mockResolvedValue({ latitude: 0, longitude: 0 })
    mockExifrParse.mockResolvedValue({
      Make: 'Nikon',
      Model: 'D850',
      DateTimeOriginal: new Date('2021-06-01T00:00:00Z'),
    })

    global.Image = jest.fn(() => {
      const img = {
        width: 300,
        height: 400,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: '',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
      queueMicrotask(() => img.onload?.())
      return img
    }) as unknown as typeof Image

    const result = await buildMeta([file])

    expect(result[0]).toMatchObject({
      make: 'Nikon',
      model: 'D850',
      takenAt: '2021-06-01T00:00:00.000Z',
      gps: { lat: 0, lon: 0 },
    })
  })

  it('uses "unknown" type when file.type is empty', async () => {
    const file = new File(['x'], 'photo.jpg', { type: '' })
    mockExifrGps.mockResolvedValue(null)
    mockExifrParse.mockResolvedValue({})

    global.Image = jest.fn(() => {
      const img = {
        width: 10,
        height: 10,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: '',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
      queueMicrotask(() => img.onload?.())
      return img
    }) as unknown as typeof Image

    const result = await buildMeta([file])

    expect(result[0].type).toBe('unknown')
  })
})
