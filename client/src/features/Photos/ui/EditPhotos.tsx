import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import styled from 'styled-components'
import { useStore } from 'react-redux'
import type { ILink } from '@shevdi-home/shared'
import type { RootState } from '@/app/store/store'
import { Button, Checkbox } from '@/shared/ui'
import { getErrorMessage } from '@/shared/utils'
import { useChangePhotoMutation } from '../model'
import { isPhotosBulkEditLocationState } from '../model/photosBulkEditNavState'
import { useBulkPerFileOptions } from '../hooks/useBulkPerFileOptions'
import { createUserSuggestionsLoader } from '../utils/userSuggestions'
import { photoCommonFormSchema } from '../utils/photoCommonForm'
import type { PerFileOptions } from '../utils/perFileOptions'
import { photoToPerFileOptions } from '../utils/photoToPerFileOptions'
import { BulkEditForm } from './BulkEditForm'
import { FileOptionsSummary } from './FileOptionsSummary'
import { BulkEditPhotoRow } from './BulkEditPhotoRow'

const bulkSaveSchema = photoCommonFormSchema.pick({
  title: true,
  priority: true,
  private: true,
  country: true,
  city: true,
  tags: true,
  accessedBy: true,
})

export function EditPhotos() {
  const location = useLocation()
  const store = useStore<RootState>()
  const fetchUserSuggestions = useMemo(
    () => createUserSuggestionsLoader(() => store.getState()),
    [store],
  )
  const [photos, setPhotos] = useState<ILink[]>(() => {
    if (!isPhotosBulkEditLocationState(location.state)) return []
    return location.state.photos.filter((p): p is ILink & { _id: string } => Boolean(p._id))
  })
  const [rowErrors, setRowErrors] = useState<Map<string, string>>(() => new Map())
  const [isSaving, setIsSaving] = useState(false)

  const {
    fileOptions,
    setFileOptions,
    selection,
    setSelection,
    toggleSelection,
    toggleSelectAll,
    mergedView,
    handleBulkUpdate,
    handleTagAdd,
    handleTagRemove,
  } = useBulkPerFileOptions()

  const [changePhoto] = useChangePhotoMutation()

  useLayoutEffect(() => {
    const next = new Map<string, PerFileOptions>()
    for (const p of photos) {
      const id = p._id
      if (!id) continue
      next.set(id, photoToPerFileOptions(p))
    }
    setFileOptions(next)
    setSelection(new Set())
  }, [photos, setFileOptions, setSelection])

  const allIds = useMemo(() => {
    const ids: string[] = []
    for (const p of photos) {
      if (p._id) ids.push(p._id)
    }
    return ids
  }, [photos])

  const removePhotoAt = useCallback((index: number) => {
    const id = photos[index]?._id
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    if (id) {
      setRowErrors((prev) => {
        const n = new Map(prev)
        n.delete(id)
        return n
      })
    }
  }, [photos])

  const handleSave = useCallback(async () => {
    setRowErrors(new Map())
    setIsSaving(true)
    try {
      for (const photo of photos) {
        const photoId = photo._id
        if (!photoId) continue

        const opts = fileOptions.get(photoId)
        if (!opts) continue

        const parsed = bulkSaveSchema.safeParse(opts)
        if (!parsed.success) {
          setRowErrors((prev) => new Map(prev).set(photoId, 'Некорректные данные'))
          continue
        }

        const { title, priority, private: isPrivate, country, city, tags, accessedBy } = parsed.data

        try {
          await changePhoto({
            id: photoId,
            data: {
              title,
              priority,
              private: isPrivate,
              tags,
              accessedBy: accessedBy.map((userId) => ({ userId })),
              location: {
                ...photo.location,
                value: {
                  country: country ?? [],
                  city: city ?? [],
                },
              },
            },
          }).unwrap()
          setRowErrors((prev) => {
            const n = new Map(prev)
            n.delete(photoId)
            return n
          })
        } catch (error: unknown) {
          setRowErrors((prev) => new Map(prev).set(photoId, getErrorMessage(error)))
        }
      }
    } finally {
      setIsSaving(false)
    }
  }, [changePhoto, fileOptions, photos])

  if (photos.length === 0) {
    return (
      <EmptyState>
        <p>Список фото для редактирования пуст. Откройте галерею и нажмите «Редактировать список».</p>
        <GalleryLink to='/photos'>К галерее</GalleryLink>
      </EmptyState>
    )
  }

  return (
    <PageContainer>
      <FileList>
        {photos.length > 1 && (
          <SelectAllRow>
            <Checkbox
              checked={selection.size === allIds.length && allIds.length > 0}
              onChange={() => toggleSelectAll(allIds)}
              label='Выбрать все'
              size='sm'
            />
            <FileCountLabel>{allIds.length} фото</FileCountLabel>
          </SelectAllRow>
        )}
        {photos.map((photo, index) => {
          const rowId = photo._id
          if (!rowId) return null
          const opts = fileOptions.get(rowId)
          return (
            <BulkEditPhotoRow
              key={rowId}
              photo={photo}
              selected={selection.has(rowId)}
              onToggleSelect={() => toggleSelection(rowId)}
              onRemove={() => removePhotoAt(index)}
              rowError={rowErrors.get(rowId)}
            >
              {opts && <FileOptionsSummary options={opts} />}
            </BulkEditPhotoRow>
          )
        })}
      </FileList>
      <BulkEditForm
        mergedView={mergedView}
        selectionCount={selection.size}
        totalCount={allIds.length}
        disabled={isSaving}
        onScalarCommit={handleBulkUpdate}
        onTagAdd={handleTagAdd}
        onTagRemove={handleTagRemove}
        fetchUserSuggestions={fetchUserSuggestions}
      />
      <SaveRow>
        <Button type='button' onClick={() => void handleSave()} disabled={isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить все'}
        </Button>
      </SaveRow>
    </PageContainer>
  )
}

const PageContainer = styled.div``

const EmptyState = styled.div`
  margin: 2rem auto;
  max-width: 28rem;
  text-align: center;
  color: var(--text-muted);
  line-height: 1.5;

  p {
    margin-bottom: 1rem;
  }
`

const FileList = styled.div`
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: var(--input-bg);
  border-radius: var(--radius-md);
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--input-border);
`

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem 0.5rem;
  border-bottom: 1px solid var(--input-border);
  margin-bottom: 0.25rem;
`

const FileCountLabel = styled.span`
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: auto;
`

const SaveRow = styled.div`
  margin-top: 1rem;
`

const GalleryLink = styled(Link)`
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
