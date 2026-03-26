import styles from './DotsProgressIndicator.module.css'

export interface DotsProgressIndicatorProps {
  className?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
}

export function DotsProgressIndicator({ className, 'aria-label': ariaLabel = 'Загрузка' }: DotsProgressIndicatorProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} role='status' aria-label={ariaLabel}>
      <span className={styles.dots} aria-hidden>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </span>
    </div>
  )
}
