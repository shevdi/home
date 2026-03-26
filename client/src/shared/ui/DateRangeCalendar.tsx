import { Calendar, Popover } from '@shevdi-home/ui-kit'
import styled from 'styled-components'

export type DateRangeCalendarProps = {
  label: string
  inputId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  displayValue: string
  placeholder?: string
  calendarValue: [Date | null, Date | null]
  onCalendarChange: (value: Date | [Date | null, Date | null] | null) => void
  onClear: () => void
  clearButtonLabel?: string
}

export function DateRangeCalendar({
  label,
  inputId,
  open,
  onOpenChange,
  displayValue,
  placeholder = '',
  calendarValue,
  onCalendarChange,
  onClear,
  clearButtonLabel = 'Сбросить',
}: DateRangeCalendarProps) {
  return (
    <DateRangeWrapper>
      <DateRangeLabel htmlFor={inputId}>{label}</DateRangeLabel>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <DateRangeInput id={inputId} type='text' readOnly value={displayValue} placeholder={placeholder} />
        </Popover.Trigger>
        <Popover.Portal>
          <CalendarPopoverContent side='bottom' align='start'>
            <Calendar.Root>
              <Calendar.View selectRange allowPartialRange value={calendarValue} onChange={onCalendarChange} />
              <Calendar.Footer>
                <Calendar.ClearButton onClick={onClear}>{clearButtonLabel}</Calendar.ClearButton>
              </Calendar.Footer>
            </Calendar.Root>
          </CalendarPopoverContent>
        </Popover.Portal>
      </Popover.Root>
    </DateRangeWrapper>
  )
}

const DateRangeWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`

const DateRangeLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-muted);
`

const CalendarPopoverContent = styled(Popover.Content)`
  max-width: 300px;
`

const DateRangeInput = styled.input`
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--input-bg);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
  }

  &:hover {
    border-color: var(--text-muted);
  }
`
