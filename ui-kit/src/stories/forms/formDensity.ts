import type { CSSProperties } from 'react'

export type FormStorySize = 'sm' | 'md' | 'lg'

/** Sets `--font-size-label` (Field labels), `--font-size-field-error`, `--font-size-field-description` for descendants. */
export const formDensityVars: Record<FormStorySize, CSSProperties> = {
  sm: {
    ['--font-size-label' as string]: '0.78rem',
    ['--font-size-field-error' as string]: '0.72rem',
    ['--font-size-field-description' as string]: '0.8rem',
  },
  md: {
    ['--font-size-label' as string]: '0.9rem',
    ['--font-size-field-error' as string]: '0.8rem',
    ['--font-size-field-description' as string]: '0.875rem',
  },
  lg: {
    ['--font-size-label' as string]: '1.02rem',
    ['--font-size-field-error' as string]: '0.9rem',
    ['--font-size-field-description' as string]: '0.95rem',
  },
}

/** Main page title (e.g. login «Вход») — matches visual weight to field density. */
export const formStoryPageTitle: Record<FormStorySize, CSSProperties> = {
  sm: { fontSize: '1.15rem', marginBottom: '1rem' },
  md: { fontSize: '1.5rem', marginBottom: '1.5rem' },
  lg: { fontSize: '1.85rem', marginBottom: '1.65rem' },
}

/** Uppercase tag above each size card («Small · sm»). */
export const formStoryCardTag: Record<FormStorySize, CSSProperties> = {
  sm: { fontSize: '0.62rem', letterSpacing: '0.09em' },
  md: { fontSize: '0.7rem', letterSpacing: '0.08em' },
  lg: { fontSize: '0.8rem', letterSpacing: '0.07em' },
}
