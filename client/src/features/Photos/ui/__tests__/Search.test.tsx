import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDispatch, useSelector } from 'react-redux'
import { Search } from '@/features/Photos/ui/Search'
import { selectFilter, selectSearch } from '../../model'
import { setOrderSearch, setTagsSearch } from '../../model/photosSlice'
import { MemoryRouter } from 'react-router'

const mockSetQueryParams = jest.fn()
jest.mock('@/shared/hooks', () => ({
  useQueryParams: () => ({
    queryParams: {},
    setQueryParams: mockSetQueryParams,
  }),
}))

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  useStore: jest.fn(),
}))

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui')
  return {
    ...actual,
    Checkbox: ({
      label,
      checked,
      onChange,
    }: {
      label: string
      checked: boolean
      onChange: (value: boolean) => void
    }) => (
      <label>
        <input type='checkbox' checked={checked} onChange={(event) => onChange(event.target.checked)} />
        {label}
      </label>
    ),
    Input: ({ label, type, ...props }: { label: string; type?: string } & Record<string, unknown>) => (
      <label>
        {label}
        <input type={type ?? 'text'} {...props} />
      </label>
    ),
  }
})

const mockUseDispatch = useDispatch as unknown as jest.Mock
const mockUseSelector = useSelector as unknown as jest.Mock

describe('Search', () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectFilter) {
        return { private: false }
      }
      if (selector === selectSearch) {
        return {
          dateFrom: null,
          dateTo: null,
          order: 'orderDownByTakenAt',
          tags: [],
          country: [],
          city: [],
        }
      }
      return undefined
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders search form with default state', () => {
    mockUseDispatch.mockReturnValue(jest.fn())

    const { container } = render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('dispatches order change when dropdown value changes', async () => {
    const dispatch = jest.fn()
    mockUseDispatch.mockReturnValue(dispatch)

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>,
    )

    const select = screen.getByLabelText('Сортировать') as HTMLSelectElement
    await userEvent.selectOptions(select, 'orderUpByTakenAt')

    expect(dispatch).toHaveBeenCalledWith(setOrderSearch('orderUpByTakenAt'))
  })

  describe('renders with different queryParams', () => {
    const renderWithQueryParams = (
      search = '',
      searchState?: {
        dateFrom?: string | null
        dateTo?: string | null
        order?: string
        tags?: string[]
        country?: string[]
        city?: string[]
      },
    ) => {
      if (searchState) {
        mockUseSelector.mockImplementation((selector: unknown) => {
          if (selector === selectFilter) return { private: false }
          if (selector === selectSearch) {
            return {
              dateFrom: searchState.dateFrom ?? null,
              dateTo: searchState.dateTo ?? null,
              order: searchState.order ?? 'orderDownByTakenAt',
              tags: searchState.tags ?? [],
              country: searchState.country ?? [],
              city: searchState.city ?? [],
            }
          }
          return undefined
        })
      }
      const initialEntries = search ? [`/photos${search}`] : ['/photos']
      return render(
        <MemoryRouter initialEntries={initialEntries}>
          <Search />
        </MemoryRouter>,
      )
    }

    beforeEach(() => {
      mockUseDispatch.mockReturnValue(jest.fn())
    })

    it('renders with order param', () => {
      const { container } = renderWithQueryParams('?order=orderUpByTakenAt', {
        order: 'orderUpByTakenAt',
      })
      expect(container).toMatchSnapshot()
    })

    it('renders with date range params', () => {
      const { container } = renderWithQueryParams('?dateFrom=2024-01-15&dateTo=2024-12-31', {
        dateFrom: '2024-01-15',
        dateTo: '2024-12-31',
      })
      expect(container).toMatchSnapshot()
    })

    it('renders with tags param', () => {
      const { container } = renderWithQueryParams('?tags=landscape,portrait', {
        tags: ['landscape', 'portrait'],
      })
      expect(container).toMatchSnapshot()
    })

    it('renders with all params', () => {
      const { container } = renderWithQueryParams(
        '?order=orderDownByEdited&dateFrom=2024-01&dateTo=2024-12&tags=foo,bar,baz',
        {
          dateFrom: '2024-01',
          dateTo: '2024-12',
          order: 'orderDownByEdited',
          tags: ['foo', 'bar', 'baz'],
        },
      )
      expect(container).toMatchSnapshot()
    })
  })

  describe('tags', () => {
    it('adds tag when Enter is pressed', async () => {
      const dispatch = jest.fn()
      mockUseDispatch.mockReturnValue(dispatch)

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>,
      )

      const tagInput = screen.getByLabelText('Теги')
      await userEvent.type(tagInput, 'landscape{Enter}')

      expect(dispatch).toHaveBeenCalledWith(setTagsSearch(['landscape']))
      expect(mockSetQueryParams).toHaveBeenCalledWith(expect.objectContaining({ tags: ['landscape'] }))
    })

    it('does not add duplicate tag', async () => {
      const dispatch = jest.fn()
      mockUseDispatch.mockReturnValue(dispatch)
      mockUseSelector.mockImplementation((selector: unknown) => {
        if (selector === selectFilter) return { private: false }
        if (selector === selectSearch) {
          return {
            dateFrom: null,
            dateTo: null,
            order: 'orderDownByTakenAt',
            tags: ['landscape'],
            country: '',
            city: '',
          }
        }
        return undefined
      })

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>,
      )

      const tagInput = screen.getByLabelText('Теги')
      await userEvent.type(tagInput, 'landscape{Enter}')

      expect(dispatch).not.toHaveBeenCalledWith(setTagsSearch(expect.any(Array)))
      expect(mockSetQueryParams).not.toHaveBeenCalled()
    })

    it('does not add empty or whitespace tag', async () => {
      const dispatch = jest.fn()
      mockUseDispatch.mockReturnValue(dispatch)

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>,
      )

      const tagInput = screen.getByLabelText('Теги')
      await userEvent.type(tagInput, '   {Enter}')

      expect(dispatch).not.toHaveBeenCalledWith(setTagsSearch(expect.any(Array)))
      expect(mockSetQueryParams).not.toHaveBeenCalled()
    })

    it('removes tag when remove button is clicked', async () => {
      const dispatch = jest.fn()
      mockUseDispatch.mockReturnValue(dispatch)
      mockUseSelector.mockImplementation((selector: unknown) => {
        if (selector === selectFilter) return { private: false }
        if (selector === selectSearch) {
          return {
            dateFrom: null,
            dateTo: null,
            order: 'orderDownByTakenAt',
            tags: ['foo', 'bar'],
            country: '',
            city: '',
          }
        }
        return undefined
      })

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>,
      )

      await userEvent.click(screen.getByLabelText('Удалить тег foo'))

      expect(dispatch).toHaveBeenCalledWith(setTagsSearch(['bar']))
      expect(mockSetQueryParams).toHaveBeenCalledWith(expect.objectContaining({ tags: ['bar'] }))
    })
  })
})
