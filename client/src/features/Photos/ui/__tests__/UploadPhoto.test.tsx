import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@/app/store/store'
import { UploadPhoto } from '../UploadPhoto'
import { buildMeta } from '../../utils/uploadPhotoMeta'
jest.mock('../../utils/uploadPhotoMeta', () => {
  const actual = jest.requireActual('../../utils/uploadPhotoMeta')
  return {
    ...actual,
    buildMeta: jest.fn(),
  }
})

const mockBuildMeta = buildMeta as jest.MockedFunction<typeof buildMeta>

const createFile = (name = 'photo.jpg') => new File(['file'], name, { type: 'image/jpeg' })
const getFileInput = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement

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

const renderWithStore = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UploadPhoto />
      </MemoryRouter>
    </Provider>,
  )

describe('UploadPhoto', () => {
  beforeEach(() => {
    mockBuildMeta.mockResolvedValue([baseMeta])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders default state and disables submit', () => {
    const { container } = renderWithStore()

    expect(container).toMatchSnapshot()
  })

  it('updates label and shows selected file', async () => {
    const { container } = renderWithStore()

    const user = userEvent.setup()
    const input = getFileInput(container)
    await user.upload(input, createFile())

    expect(container).toMatchSnapshot()
  })

  it('submits files and calls fetch for upload', async () => {
    const sseData = [
      `data: ${JSON.stringify({ type: 'progress', fileIndex: 0, result: { ok: true, fileName: 'photo.jpg', photo: { _id: 'photo-123' } } })}\n\n`,
      `data: ${JSON.stringify({ type: 'complete', successCount: 1, errorsCount: 0, totalCount: 1 })}\n\n`,
    ].join('')
    const mockStream = {
      getReader: () => ({
        read: jest
          .fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode(sseData), done: false })
          .mockResolvedValue({ value: new Uint8Array(0), done: true }),
        releaseLock: jest.fn(),
      }),
    }
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
    })
    global.fetch = mockFetch

    const { container } = renderWithStore()

    const user = userEvent.setup()
    const input = getFileInput(container)
    await user.upload(input, createFile())

    await user.click(screen.getByRole('button', { name: 'Загрузить 1 фото' }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/photos/upload'),
      expect.any(Object),
    )
  })

  it('shows error message when upload fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const { container } = renderWithStore()

    const user = userEvent.setup()
    const input = getFileInput(container)
    await user.upload(input, createFile())
    await user.click(screen.getByRole('button', { name: 'Загрузить 1 фото' }))

    await waitFor(() => expect(screen.getByText(/Не удалось загрузить файлы|Network error/)).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })
})
