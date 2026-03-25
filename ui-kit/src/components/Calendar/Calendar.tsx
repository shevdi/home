import * as React from 'react'
import ReactCalendar from 'react-calendar'
import type { CalendarProps } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import styles from './Calendar.module.css'

const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export type CalendarViewProps = CalendarProps

function Root({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')} {...props} />
}

function View({ className, locale = 'ru-RU', formatShortWeekday, ...props }: CalendarViewProps) {
  const fmt =
    formatShortWeekday ??
    (locale === 'ru-RU'
      ? (_locale: string | undefined, date: Date) => WEEKDAY_LABELS[date.getDay()]
      : undefined)

  return (
    <ReactCalendar
      className={[styles.view, className].filter(Boolean).join(' ')}
      locale={locale}
      formatShortWeekday={fmt}
      {...props}
    />
  )
}

View.displayName = 'Calendar.View'

function Footer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.footer, className].filter(Boolean).join(' ')} {...props} />
}

const ClearButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CalendarClearButton({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={[styles.clearBtn, className].filter(Boolean).join(' ')}
        {...props}
      />
    )
  },
)

ClearButton.displayName = 'Calendar.ClearButton'

export const Calendar = {
  Root,
  View,
  Footer,
  ClearButton,
}
