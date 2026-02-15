import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import styled from 'styled-components'

const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export interface CalendarPopoverProps {
  value: [Date | null, Date | null]
  onChange: (value: Date | [Date | null, Date | null] | null) => void
  onClear: () => void
  clearLabel?: string
  locale?: string
}

export const CalendarPopover = ({
  value,
  onChange,
  onClear,
  clearLabel = 'Сбросить',
  locale = 'ru-RU',
}: CalendarPopoverProps) => (
  <PopoverContainer>
    <StyledCalendar
      locale={locale}
      selectRange
      allowPartialRange
      value={value}
      onChange={onChange}
      formatShortWeekday={(_, date) => WEEKDAY_LABELS[date.getDay()]}
    />
    <CalendarFooter>
      <ClearDatesButton type='button' onClick={onClear}>
        {clearLabel}
      </ClearDatesButton>
    </CalendarFooter>
  </PopoverContainer>
)

const PopoverContainer = styled.div`
  position: absolute;
  left: 0;
  margin-top: 0.25rem;
  padding: 1rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  z-index: 100;
`

const CalendarFooter = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--input-border);
`

const ClearDatesButton = styled.button`
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    color: var(--text-color);
    border-color: var(--text-muted);
  }
`

const StyledCalendar = styled(Calendar)`
  --react-calendar-tile-font-size: 0.9rem;
  --react-calendar-tile-height: 1.75rem;
  width: 100%;
  border: none;
  font-family: inherit;

  .react-calendar__navigation {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .react-calendar__navigation button {
    min-width: 2rem;
    font-size: 1rem;
    color: var(--text-color);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .react-calendar__navigation button:hover {
    background: var(--input-focus-shadow);
  }

  .react-calendar__month-view__weekdays {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-align: center;
  }

  .react-calendar__month-view__days__day {
    color: var(--text-color);
  }

  .react-calendar__tile {
    padding: 0.5em;
    border-radius: var(--radius-sm);
  }

  .react-calendar__tile:hover {
    background: var(--input-focus-shadow);
  }

  .react-calendar__tile--now {
    font-weight: 600;
  }
`
