import * as React from 'react'
import ReactCalendar from 'react-calendar'
import type { CalendarProps } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { WEEKDAY_LABELS } from './calendarWeekdays'
import styles from './Calendar.module.css'

const viewSizeClass = { sm: styles.viewSm, md: styles.viewMd, lg: styles.viewLg } as const

export type CalendarViewProps = CalendarProps & { size?: 'sm' | 'md' | 'lg' }

export function CalendarView({
  className,
  locale = 'ru-RU',
  formatShortWeekday,
  size = 'md',
  ...props
}: CalendarViewProps) {
  const fmt =
    formatShortWeekday ??
    (locale === 'ru-RU'
      ? (_locale: string | undefined, date: Date) => WEEKDAY_LABELS[date.getDay()]
      : undefined)

  return (
    <ReactCalendar
      className={[styles.view, viewSizeClass[size], className].filter(Boolean).join(' ')}
      locale={locale}
      formatShortWeekday={fmt}
      {...props}
    />
  )
}

CalendarView.displayName = 'Calendar.View'
