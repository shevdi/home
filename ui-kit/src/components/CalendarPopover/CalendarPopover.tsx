import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import styles from './CalendarPopover.module.css'

const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export interface CalendarPopoverProps {
  value: [Date | null, Date | null]
  onChange: (value: Date | [Date | null, Date | null] | null) => void
  onClear: () => void
  clearLabel?: string
  locale?: string
}

export function CalendarPopover({
  value,
  onChange,
  onClear,
  clearLabel = 'Сбросить',
  locale = 'ru-RU',
}: CalendarPopoverProps) {
  return (
    <div className={styles.popover}>
      <Calendar
        className={styles.calendar}
        locale={locale}
        selectRange
        allowPartialRange
        value={value}
        onChange={onChange}
        formatShortWeekday={(_, date) => WEEKDAY_LABELS[date.getDay()]}
      />
      <div className={styles.footer}>
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          {clearLabel}
        </button>
      </div>
    </div>
  )
}
