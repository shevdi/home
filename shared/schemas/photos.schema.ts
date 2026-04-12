import { z } from 'zod'

export const photoOrderSchema = z.enum([
  'orderDownByTakenAt',
  'orderUpByTakenAt',
  'orderDownByEdited',
])

export type PhotoOrder = z.infer<typeof photoOrderSchema>

export const queryParam = z.union([z.string(), z.array(z.string())]).optional()

export const stringOrArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v : v ? [v] : []))

export const photoSearchParamsSchema = z.object({
  page: queryParam.transform((v) => {
    const s = Array.isArray(v) ? v[0] : v
    return s ? parseInt(s, 10) : 1
  }),
  dateFrom: queryParam.transform((v) => (Array.isArray(v) ? v[0] : v) ?? undefined),
  dateTo: queryParam.transform((v) => (Array.isArray(v) ? v[0] : v) ?? undefined),
  order: queryParam.transform((v) => {
    const s = Array.isArray(v) ? v[0] : v
    return s && photoOrderSchema.safeParse(s).success ? s : undefined
  }),
  tags: stringOrArray,
  country: stringOrArray,
  city: stringOrArray,
})

export type PhotoSearchParams = z.infer<typeof photoSearchParamsSchema>

export const uploadMetaItemSchema = z.object({
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  gpsAltitude: z.number().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  takenAt: z.string().optional(),
})

export const uploadMetaSchema = z.array(uploadMetaItemSchema)

const objectIdHex = z.string().regex(/^[a-fA-F0-9]{24}$/)

const accessedByFromJsonField = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null || String(v).trim() === '') return [] as { userId: string }[]
    try {
      const parsed = JSON.parse(String(v)) as unknown
      if (!Array.isArray(parsed)) return []
      const out: { userId: string }[] = []
      for (const item of parsed) {
        if (item && typeof item === 'object' && 'userId' in item) {
          const id = (item as { userId: unknown }).userId
          if (typeof id === 'string' && objectIdHex.safeParse(id).success) {
            out.push({ userId: id })
          }
        }
      }
      return out
    } catch {
      return []
    }
  })

export const uploadBodySchema = z.object({
  title: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null) return undefined
      const t = String(v).trim()
      return t === '' ? undefined : t
    }),
  private: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined
      if (typeof v === 'boolean') return v
      const lower = String(v).toLowerCase()
      return lower === 'true' || lower === '1'
    }),
  tags: stringOrArray,
  country: stringOrArray,
  city: stringOrArray,
  meta: z.string().optional().transform((v) => {
    if (!v) return []
    try {
      const parsed = JSON.parse(v)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }),
  priority: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || String(v).trim() === '') return undefined
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }),
  accessedBy: accessedByFromJsonField,
})

export type UploadBody = z.infer<typeof uploadBodySchema>

export const photoUpdateBodySchema = z.object({
  title: z.string().optional(),
  priority: z.number().optional(),
  private: z.boolean().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  location: z.unknown().optional(),
  accessedBy: z.array(z.object({ userId: objectIdHex })).optional(),
})

export type PhotoUpdateBody = z.infer<typeof photoUpdateBodySchema>
