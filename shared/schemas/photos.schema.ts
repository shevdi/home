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

export const uploadBodySchema = z.object({
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
})

export type UploadBody = z.infer<typeof uploadBodySchema>
