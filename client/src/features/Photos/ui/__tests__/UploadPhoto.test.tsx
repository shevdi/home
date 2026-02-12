import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadPhoto } from '../UploadPhoto'
import { useUploadPhotosMutation } from '../../model'
import { buildMeta } from '../../utils/uploadPhotoMeta'

jest.mock('../../model', () => ({
  useUploadPhotosMutation: jest.fn(),
}))

jest.mock('../../utils/uploadPhotoMeta', () => {
  const actual = jest.requireActual('../../utils/uploadPhotoMeta')
  return {
    ...actual,
    buildMeta: jest.fn(),
  }
})

const mockUseUploadPhotosMutation = useUploadPhotosMutation as jest.Mock
const mockBuildMeta = buildMeta as jest.MockedFunction<typeof buildMeta>

const createFile = (name = 'photo.jpg') => new File(['file'], name, { type: 'image/jpeg' })
const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"][name="files"]') as HTMLInputElement

type BuildMetaItem = Awaited<ReturnType<typeof buildMeta>>[number]

const baseMeta: BuildMetaItem = {
  name: 'photo.jpg',
  size: 4,
  type: 'image/jpeg',
  lastModified: 123,
  width: undefined,
  height: undefined,
  gps: { lat: 1, lon: 2, alt: 3 },
  make: 'Canon',
  model: 'M50',
  takenAt: '2020-01-01T00:00:00Z',
}

describe('UploadPhoto', () => {
  beforeEach(() => {
    mockBuildMeta.mockResolvedValue([baseMeta])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders default state and disables submit', () => {
    const uploadPhoto = jest.fn()
    mockUseUploadPhotosMutation.mockReturnValue([uploadPhoto, { isLoading: false }])

    const { container } = render(<UploadPhoto />)

    expect(container).toMatchSnapshot()
  })

  it('updates label and shows selected file', async () => {
    const uploadPhoto = jest.fn()
    mockUseUploadPhotosMutation.mockReturnValue([uploadPhoto, { isLoading: false }])

    const { container } = render(<UploadPhoto />)

    const user = userEvent.setup()
    const input = getFileInput(container)
    await user.upload(input, createFile())

    expect(container).toMatchSnapshot()
  })

  it('submits files and shows success message', async () => {
    const uploadPhoto = jest.fn().mockResolvedValue({
      data: { ok: true, successCount: 1, errorsCount: 0, totalCount: 1 },
    })
    mockUseUploadPhotosMutation.mockReturnValue([uploadPhoto, { isLoading: false }])

    const { container } = render(<UploadPhoto />)

    const user = userEvent.setup()
    const input = getFileInput(container)
    await user.upload(input, createFile())

    await user.click(screen.getByRole('button', { name: 'Загрузить 1 фото' }))

    await waitFor(() => expect(uploadPhoto).toHaveBeenCalledTimes(1))

    const formData = uploadPhoto.mock.calls[0][0] as FormData
    expect(formData.get('private')).toBe('false')
    expect(formData.getAll('files')).toHaveLength(1)
    expect(JSON.parse(formData.get('meta') as string)).toEqual([
      {
        gpsLatitude: 1,
        gpsLongitude: 2,
        gpsAltitude: 3,
        make: 'Canon',
        model: 'M50',
        takenAt: '2020-01-01T00:00:00Z',
      },
    ])

    expect(await screen.findByText('Загружено: 1 из 1. Ошибок: 0')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('photo.jpg')).not.toBeInTheDocument())
    expect(screen.getByText('Загрузить фото', { selector: 'label' })).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('shows error message when upload fails', async () => {
    const uploadPhoto = jest.fn().mockRejectedValue(new Error('boom'))
    mockUseUploadPhotosMutation.mockReturnValue([uploadPhoto, { isLoading: false }])

    const { container } = render(<UploadPhoto />)

    const user = userEvent.setup()
    const input = getFileInput(container)
    await user.upload(input, createFile())
    await user.click(screen.getByRole('button', { name: 'Загрузить 1 фото' }))

    expect(container).toMatchSnapshot()
  })
})
