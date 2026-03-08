import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ILink } from '@shevdi-home/shared'
import { PhotosNavigation } from '../PhotosNavigation'

const minimalLink = (overrides: Partial<ILink> = {}): ILink => ({
  _id: '',
  location: {},
  ...overrides,
})

const renderWithRouter = (
  path: string,
  props: {
    photo: ILink | null
    neighbours: (ILink | undefined)[]
    pathSuffix?: string
  },
) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PhotosNavigation {...props} />
    </MemoryRouter>,
  )

describe('PhotosNavigation', () => {
  it('renders previous and next links when neighbours exist', () => {
    renderWithRouter('/photos/photo-1', {
      photo: minimalLink({ _id: 'photo-1', fullSizeUrl: '/full.jpg' }),
      neighbours: [minimalLink({ _id: 'photo-0' }), minimalLink({ _id: 'photo-2' })],
    })

    expect(screen.getByText('← Предыдущее')).toHaveAttribute('href', '/photos/photo-0')
    expect(screen.getByText('Следующее →')).toHaveAttribute('href', '/photos/photo-2')
  })

  it('renders full size link when photo exists', () => {
    renderWithRouter('/photos/photo-1', {
      photo: minimalLink({ _id: 'photo-1', fullSizeUrl: '/full.jpg' }),
      neighbours: [undefined, undefined],
    })

    const fullSizeLink = screen.getByText('Полный размер')
    expect(fullSizeLink).toHaveAttribute('href', '/full.jpg')
    expect(fullSizeLink).toHaveAttribute('target', '_blank')
  })

  it('renders pathSuffix for edit mode', () => {
    renderWithRouter('/photos/photo-1/edit', {
      photo: minimalLink({ _id: 'photo-1' }),
      neighbours: [minimalLink({ _id: 'photo-0' }), minimalLink({ _id: 'photo-2' })],
      pathSuffix: '/edit',
    })

    expect(screen.getByText('← Предыдущее')).toHaveAttribute('href', '/photos/photo-0/edit')
    expect(screen.getByText('Следующее →')).toHaveAttribute('href', '/photos/photo-2/edit')
  })

  it('hides previous link when no previous neighbour', () => {
    renderWithRouter('/photos/photo-1', {
      photo: minimalLink({ _id: 'photo-1' }),
      neighbours: [undefined, minimalLink({ _id: 'photo-2' })],
    })

    expect(screen.queryByText('← Предыдущее')).not.toBeInTheDocument()
    expect(screen.getByText('Следующее →')).toBeInTheDocument()
  })

  it('hides next link when no next neighbour', () => {
    renderWithRouter('/photos/photo-1', {
      photo: minimalLink({ _id: 'photo-1' }),
      neighbours: [minimalLink({ _id: 'photo-0' }), undefined],
    })

    expect(screen.getByText('← Предыдущее')).toBeInTheDocument()
    expect(screen.queryByText('Следующее →')).not.toBeInTheDocument()
  })
})
