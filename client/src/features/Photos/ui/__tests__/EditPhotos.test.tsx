import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { EditPhotos } from '../EditPhotos'
import { useChangePhotoMutation } from '../../model'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
  useStore: jest.fn(() => ({
    getState: () => ({}),
  })),
}))

jest.mock('../../model', () => {
  const actual = jest.requireActual('../../model')
  return {
    ...actual,
    useChangePhotoMutation: jest.fn(),
  }
})

jest.mock('@/shared/ui', () => ({
  ...jest.requireActual<typeof import('@/shared/ui')>('@/shared/ui'),
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button type='button' {...props}>
      {children}
    </button>
  ),
  Checkbox: ({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (v: boolean) => void }) => (
    <label>
      <input type='checkbox' checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
      {label}
    </label>
  ),
}))

const mockUseChangePhotoMutation = useChangePhotoMutation as unknown as jest.Mock

const handoffPhoto = {
  _id: 'photo-1',
  title: 'Test Photo',
  smSizeUrl: '/thumb.jpg',
  mdSizeUrl: '/md.jpg',
  priority: 0,
  private: false,
  tags: ['tag1'],
  location: { value: { country: ['Russia'], city: ['Moscow'] } },
  accessedBy: [],
}

describe('EditPhotos', () => {
  beforeEach(() => {
    mockUseChangePhotoMutation.mockReturnValue([jest.fn().mockResolvedValue({}), { isLoading: false }])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows empty state when navigation state is missing', () => {
    render(
      <MemoryRouter initialEntries={['/photos/edit']}>
        <EditPhotos />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Список фото для редактирования пуст/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'К галерее' })).toHaveAttribute('href', '/photos')
  })

  it('renders handed-off photos and bulk controls', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/photos/edit',
            state: { photos: [handoffPhoto] },
          },
        ]}
      >
        <EditPhotos />
      </MemoryRouter>,
    )

    expect(screen.getByText('Test Photo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сохранить все' })).toBeInTheDocument()
  })
})
