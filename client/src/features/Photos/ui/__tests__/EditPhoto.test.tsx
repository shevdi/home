import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { EditPhoto } from '../EditPhoto'
import { useChangePhotoMutation } from '../../model'
import { usePhoto } from '../../hooks/usePhoto'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
  useStore: jest.fn(),
}))

jest.mock('../../model', () => {
  const actual = jest.requireActual('../../model')
  return {
    ...actual,
    useChangePhotoMutation: jest.fn(),
  }
})

jest.mock('../../hooks/usePhoto', () => ({
  usePhoto: jest.fn(),
}))

jest.mock('../DeletePhoto', () => ({
  DeletePhoto: () => <div data-testid='delete-photo'>delete</div>,
}))

jest.mock('@/shared/ui', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Checkbox: ({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (v: boolean) => void }) => (
    <label>
      <input type='checkbox' checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
      {label}
    </label>
  ),
  ErrMessage: ({ children }: { children?: React.ReactNode }) => <div data-testid='err-message'>{children}</div>,
  Field: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  Loader: () => <div data-testid='loader'>loader</div>,
  TaggedInput: ({
    tags,
    inputValue,
    onInputValueChange,
    placeholder,
  }: {
    tags: string[]
    inputValue: string
    onInputValueChange: (v: string) => void
    placeholder?: string
  }) => (
    <div data-testid='tagged-input'>
      <input
        value={inputValue}
        onChange={(e) => onInputValueChange(e.target.value)}
        placeholder={placeholder}
      />
      {tags?.map((tag: string) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  ),
}))

const mockUseChangePhotoMutation = useChangePhotoMutation as unknown as jest.Mock
const mockUsePhoto = usePhoto as jest.Mock

const basePhoto = {
  _id: 'photo-1',
  title: 'Test Photo',
  mdSizeUrl: '/photo-md.jpg',
  priority: 0,
  private: false,
  tags: ['tag1'],
  location: { value: { country: ['Russia'], city: ['Moscow'] } },
}

const renderWithPath = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <EditPhoto />
    </MemoryRouter>,
  )

describe('EditPhoto', () => {
  beforeEach(() => {
    mockUsePhoto.mockReturnValue({
      photo: basePhoto,
      neighbours: [undefined, undefined],
      isLoading: false,
    })
    mockUseChangePhotoMutation.mockReturnValue([jest.fn().mockResolvedValue({}), { isLoading: false }])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with photo data', () => {
    renderWithPath('/photos/photo-1/edit')

    expect(screen.getByDisplayValue('Test Photo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0')).toBeInTheDocument()
    expect(screen.getByText('tag1')).toBeInTheDocument()
  })

  it('renders PhotosNavigation with pathSuffix', () => {
    mockUsePhoto.mockReturnValue({
      photo: basePhoto,
      neighbours: [{ _id: 'photo-0' }, { _id: 'photo-2' }],
      isLoading: false,
    })

    renderWithPath('/photos/photo-1/edit')

    expect(screen.getByText('← Предыдущее')).toHaveAttribute('href', '/photos/photo-0/edit')
    expect(screen.getByText('Следующее →')).toHaveAttribute('href', '/photos/photo-2/edit')
  })

  it('resets form when photo changes', async () => {
    const { rerender } = renderWithPath('/photos/photo-1/edit')
    expect(screen.getByDisplayValue('Test Photo')).toBeInTheDocument()

    mockUsePhoto.mockReturnValue({
      photo: { ...basePhoto, _id: 'photo-2', title: 'Other Photo' },
      neighbours: [undefined, undefined],
      isLoading: false,
    })

    rerender(
      <MemoryRouter initialEntries={['/photos/photo-2/edit']}>
        <EditPhoto />
      </MemoryRouter>,
    )

    await screen.findByDisplayValue('Other Photo')
  })

  it('renders loader when loading', () => {
    mockUsePhoto.mockReturnValue({
      photo: undefined,
      neighbours: [undefined, undefined],
      isLoading: true,
    })

    renderWithPath('/photos/photo-1/edit')

    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })
})
