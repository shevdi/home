import styles from './DotsProgressIndicator.module.css'

const rootSizeClass = { sm: styles.rootSm, md: styles.rootMd, lg: styles.rootLg } as const

export interface DotsProgressIndicatorProps {
  className?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DotsProgressIndicator({
  className,
  'aria-label': ariaLabel = 'Загрузка',
  size = 'md',
}: DotsProgressIndicatorProps) {
  return (
    <div
      className={[styles.root, rootSizeClass[size], className].filter(Boolean).join(' ')}
      role='status'
      aria-label={ariaLabel}
    >
      <span className={styles.dots} aria-hidden>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </span>
    </div>
  )
}
