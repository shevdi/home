import styles from './Loader.module.css'

export interface LoaderProps {
  message?: string
  inline?: boolean
}

export function Loader({ message, inline }: LoaderProps) {
  if (inline) {
    return <div className={`${styles.spinner} ${styles.spinnerInline}`} />
  }
  return (
    <div className={styles.wrapper}>
      {message ? <p className={styles.message}>{message}</p> : <div className={`${styles.spinner} ${styles.spinnerDefault}`} />}
    </div>
  )
}
