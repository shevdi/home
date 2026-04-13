import { z } from 'zod'

export const photoCommonFormSchema = z.object({
  title: z.string(),
  priority: z.number(),
  private: z.boolean(),
  country: z.array(z.string()),
  city: z.array(z.string()),
  tags: z.array(z.string()),
  /** Mongo user ids (hex) granted access to private photos */
  accessedBy: z.array(z.string()),
  countryInput: z.string().optional(),
  cityInput: z.string().optional(),
  tagInput: z.string().optional(),
  accessedByInput: z.string().optional(),
})

export type PhotoCommonFormValues = z.infer<typeof photoCommonFormSchema>

export const photoCommonFormDefaults: PhotoCommonFormValues = {
  title: '',
  priority: 0,
  private: false,
  country: [],
  city: [],
  tags: [],
  accessedBy: [],
  countryInput: '',
  cityInput: '',
  tagInput: '',
  accessedByInput: '',
}