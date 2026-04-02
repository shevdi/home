import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Page } from '../Page'
import { useGetPageQuery } from '../../model/pageSlice'

jest.mock('../../model/pageSlice', () => ({
  useGetPageQuery: jest.fn(),
}))

jest.mock('@/shared/ui', () => ({
  Loader: () => <div data-testid="page-loader">loader</div>,
  Error: ({ message }: { message: string }) => <div data-testid="page-error">{message}</div>,
}))

const mockUseGetPageQuery = useGetPageQuery as unknown as jest.Mock

describe('Page', () => {
  beforeEach(() => {
    mockUseGetPageQuery.mockReset()
  })

  it('shows cached title when refetch failed but RTK still exposes last data (e.g. offline)', () => {
    mockUseGetPageQuery.mockReturnValue({
      data: {
        title: 'Cached title',
        text: 'Cached body',
        links: [],
      },
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <Page url="welcome" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Cached title' })).toBeInTheDocument()
    expect(screen.getByText('Cached body')).toBeInTheDocument()
    expect(screen.queryByTestId('page-error')).not.toBeInTheDocument()
  })

  it('shows error when there is no data', () => {
    mockUseGetPageQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <Page url="welcome" />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('page-error')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Cached title' })).not.toBeInTheDocument()
  })

  it('shows loader on first load without cache', () => {
    mockUseGetPageQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <Page url="welcome" />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('page-loader')).toBeInTheDocument()
  })
})
