import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDispatch, useSelector } from 'react-redux'
import { Filter } from '../Filter'
import { setOrderFilter } from '../../model/photosSlice'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  useStore: jest.fn(),
}))

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui')
  return {
    ...actual,
    Checkbox: ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
      <label>
        <input
          type='checkbox'
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        {label}
      </label>
    ),
    Input: ({
      label,
      value,
      onChange,
      type,
    }: {
      label: string
      value: string
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
      type?: string
    }) => (
      <label>
        {label}
        <input type={type ?? 'text'} value={value} onChange={onChange} />
      </label>
    ),
  }
})

const mockUseDispatch = useDispatch as unknown as jest.Mock
const mockUseSelector = useSelector as unknown as jest.Mock

describe('Filter', () => {
  beforeEach(() => {
    mockUseSelector.mockReturnValue({
      private: false,
      dateFrom: null,
      dateTo: null,
      order: 'orderDownByTakenAt',
      tags: [],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('dispatches order change when dropdown value changes', async () => {
    const dispatch = jest.fn()
    mockUseDispatch.mockReturnValue(dispatch)

    render(<Filter />)

    const select = screen.getByLabelText('Сортировать') as HTMLSelectElement
    await userEvent.selectOptions(select, 'orderUpByTakenAt')

    expect(dispatch).toHaveBeenCalledWith(setOrderFilter('orderUpByTakenAt'))
  })

  it('hides controls when filters are hidden', () => {
    const dispatch = jest.fn()
    mockUseDispatch.mockReturnValue(dispatch)

    render(<Filter isHiddenFilters />)

    expect(screen.queryByLabelText('Сортировать')).not.toBeInTheDocument()
    expect(screen.queryByText('Приватные')).not.toBeInTheDocument()
  })
})
