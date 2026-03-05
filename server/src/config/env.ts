import { z } from 'zod'

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(1, { error: 'ACCESS_TOKEN_SECRET is required' }),
  REFRESH_TOKEN_SECRET: z.string().min(1, { error: 'REFRESH_TOKEN_SECRET is required' }),
  DRIME_TOKEN: z.string().optional(),
  NOMINATIM_URL: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
  console.error('Invalid environment configuration:\n' + issues)
  process.exit(1)
}

export const env = parsed.data
