import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import type { SubmitHandler} from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Button, Checkbox, DotsProgressIndicator, ErrMessage, FileDropzone } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { useStore } from 'react-redux'
import type { RootState } from '@/app/store/store'
import type { FileMeta } from '../utils/uploadPhotoMeta';
import { buildMeta } from '../utils/uploadPhotoMeta'
import { getFileId, removeUploadFile, resetUpload, uploadPhotosThunk } from '../model'
import { FileData } from '@/features/Photos/ui/FileData'
import { getErrorMessage } from '@/shared/utils'
import { createUserSuggestionsLoader } from '../utils/userSuggestions'
import type { PerFileOptions } from '../utils/perFileOptions'
import { defaultPerFileOptions, computeMergedView, getTargetIds } from '../utils/perFileOptions'
import { FileOptionsSummary } from '@/features/Photos/ui/FileOptionsSummary'
import { BulkEditForm } from '@/features/Photos/ui/BulkEditForm'

const getFileLabel = (count: number) => {
  if (count === 0) return 'Загрузить фото'
  if (count === 1) return '1 файл выбран'
  if (count < 5) return `${count} файла выбрано`
  return `${count} файлов выбрано`
}

const getSubmitLabel = (count: number, isProcessed: boolean) => {
  if (isProcessed) return 'Загружается...'
  return `Загрузить ${count > 0 ? `${count} ` : ''}фото`
}

const IMAGE_ACCEPT = {
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
} as const

const schema = z.object({
  files: z.array(z.instanceof(File)).min(1, { error: 'Пожалуйста, выберите файлы' }),
})

type FormFields = z.infer<typeof schema>

export function UploadPhoto() {
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()
  const fetchUserSuggestions = useMemo(
    () => createUserSuggestionsLoader(() => store.getState()),
    [store],
  )
  const [fileMeta, setFileMeta] = useState<FileMeta[]>([])
  const [fileOptions, setFileOptions] = useState<Map<string, PerFileOptions>>(new Map())
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const { files: uploadFiles, isUploading } = useAppSelector((state) => state.upload)

  const uploadStatusById = useMemo(() => {
    const map = new Map<
      string,
      { status: 'pending' | 'uploading' | 'success' | 'error'; photoId?: string; error?: string }
    >()
    for (const f of uploadFiles) {
      map.set(f.id, { status: f.status, photoId: f.photoId, error: f.error })
    }
    return map
  }, [uploadFiles])

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      files: [],
    },
  })

  const files = useWatch({ control, name: 'files', defaultValue: [] })
  const isProcessed = isUploading

  const fileLabel = useMemo(() => getFileLabel(files.length), [files.length])

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      dispatch(resetUpload())
      setValue('files', acceptedFiles, { shouldValidate: true })
      setFileMeta(acceptedFiles.length ? await buildMeta(acceptedFiles) : [])
      const newOptions = new Map<string, PerFileOptions>()
      for (const file of acceptedFiles) {
        newOptions.set(getFileId(file), { ...defaultPerFileOptions })
      }
      setFileOptions(newOptions)
      setSelection(new Set())
    },
    [dispatch, setValue],
  )

  const removeFileAt = useCallback(
    (index: number) => {
      if (isUploading) return
      const removedId = getFileId(files[index])
      const next = files.filter((_, i) => i !== index)
      setValue('files', next, { shouldValidate: true, shouldDirty: true })
      setFileMeta((prev) => prev.filter((_, i) => i !== index))
      setFileOptions((prev) => {
        const updated = new Map(prev)
        updated.delete(removedId)
        return updated
      })
      setSelection((prev) => {
        if (!prev.has(removedId)) return prev
        const updated = new Set(prev)
        updated.delete(removedId)
        return updated
      })
      if (next.length === 0) dispatch(resetUpload())
    },
    [dispatch, files, isUploading, setValue],
  )

  const allFileIds = useMemo(
    () => files.map((f) => getFileId(f)),
    [files],
  )

  const toggleSelection = useCallback((fileId: string) => {
    setSelection((prev) => {
      const updated = new Set(prev)
      if (updated.has(fileId)) updated.delete(fileId)
      else updated.add(fileId)
      return updated
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelection((prev) =>
      prev.size === allFileIds.length ? new Set() : new Set(allFileIds),
    )
  }, [allFileIds])

  const mergedView = useMemo(
    () => computeMergedView(fileOptions, selection),
    [fileOptions, selection],
  )

  const handleBulkUpdate = useCallback(
    (field: keyof PerFileOptions, value: unknown) => {
      const targets = getTargetIds(fileOptions, selection)
      setFileOptions((prev) => {
        const updated = new Map(prev)
        for (const id of targets) {
          const current = updated.get(id)
          if (!current) continue
          updated.set(id, { ...current, [field]: value })
        }
        return updated
      })
    },
    [fileOptions, selection],
  )

  const handleTagAdd = useCallback(
    (field: 'country' | 'city' | 'tags' | 'accessedBy', tag: string) => {
      const targets = getTargetIds(fileOptions, selection)
      setFileOptions((prev) => {
        const updated = new Map(prev)
        for (const id of targets) {
          const current = updated.get(id)
          if (!current) continue
          const arr = current[field]
          if (!arr.includes(tag)) {
            updated.set(id, { ...current, [field]: [...arr, tag] })
          }
        }
        return updated
      })
    },
    [fileOptions, selection],
  )

  const handleTagRemove = useCallback(
    (field: 'country' | 'city' | 'tags' | 'accessedBy', tag: string) => {
      const targets = getTargetIds(fileOptions, selection)
      setFileOptions((prev) => {
        const updated = new Map(prev)
        for (const id of targets) {
          const current = updated.get(id)
          if (!current) continue
          updated.set(id, {
            ...current,
            [field]: current[field].filter((t) => t !== tag),
          })
        }
        return updated
      })
    },
    [fileOptions, selection],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => void handleDrop(acceptedFiles),
    accept: IMAGE_ACCEPT,
    disabled: isProcessed,
    multiple: true,
  })

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const metaForSubmit = await buildMeta(data.files)
    const orderedPerFileOptions = data.files.map((file) => {
      const id = getFileId(file)
      return fileOptions.get(id) ?? { ...defaultPerFileOptions }
    })

    // #region agent log
    {
      const hits = data.files.filter((f) => fileOptions.has(getFileId(f))).length
      fetch('http://127.0.0.1:7915/ingest/9992f24d-00f6-41c9-bc27-a45102f4306c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd2a394' },
        body: JSON.stringify({
          sessionId: 'd2a394',
          location: 'UploadPhoto.tsx:onSubmit',
          message: 'upload submit per-file',
          data: {
            fileCount: data.files.length,
            mapSize: fileOptions.size,
            idHits: hits,
            nonEmptyTitles: orderedPerFileOptions.filter((o) => o.title?.trim()).length,
            anyPrivate: orderedPerFileOptions.some((o) => o.private),
            tagSets: orderedPerFileOptions.filter((o) => o.tags.length > 0).length,
          },
          timestamp: Date.now(),
          hypothesisId: 'H1',
        }),
      }).catch(() => {})
    }
    // #endregion

    try {
      await dispatch(
        uploadPhotosThunk({
          files: data.files,
          meta: metaForSubmit,
          perFileOptions: orderedPerFileOptions,
        }),
      ).unwrap()
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError('root', {
        message: message || 'Не удалось загрузить файлы',
      })
    }
  }

  return (
    <PageContainer>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileDropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          disabled={isProcessed}
          error={errors.files?.message}
        >
          {fileLabel}
        </FileDropzone>
        {isUploading && <DotsProgressIndicator />}
        {(files.length > 0 || uploadFiles.length > 0) && (
          <FileList>
            {files.length > 1 && (
              <SelectAllRow>
                <Checkbox
                  checked={selection.size === allFileIds.length && allFileIds.length > 0}
                  onChange={toggleSelectAll}
                  label='Выбрать все'
                  size='sm'
                />
                <FileCountLabel>{allFileIds.length} файл(ов)</FileCountLabel>
              </SelectAllRow>
            )}
            {files.length > 0
              ? files.map((file, index) => {
                  const fileId = getFileId(file)
                  const statusInfo = uploadStatusById.get(fileId)
                  const opts = fileOptions.get(fileId)
                  return (
                    <FileData
                      key={fileId}
                      file={file}
                      name={file.name}
                      meta={fileMeta[index]}
                      status={statusInfo?.status}
                      photoId={statusInfo?.photoId}
                      error={statusInfo?.error}
                      onRemove={isProcessed ? undefined : () => removeFileAt(index)}
                      selected={selection.has(fileId)}
                      onToggleSelect={isProcessed ? undefined : () => toggleSelection(fileId)}
                    >
                      {opts && <FileOptionsSummary options={opts} />}
                    </FileData>
                  )
                })
              : uploadFiles.map((entry) => (
                  <FileData
                    key={entry.id}
                    name={entry.name}
                    meta={entry.meta}
                    status={entry.status}
                    photoId={entry.photoId}
                    error={entry.error}
                    thumbnailUrl={entry.thumbnailUrl}
                    thumbnailDataUrl={entry.thumbnailDataUrl}
                    onRemove={isProcessed ? undefined : () => dispatch(removeUploadFile(entry.id))}
                  />
                ))}
          </FileList>
        )}
        {files.length > 0 && (
          <BulkEditForm
            mergedView={mergedView}
            selectionCount={selection.size}
            totalCount={allFileIds.length}
            disabled={isProcessed}
            onScalarCommit={handleBulkUpdate}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            fetchUserSuggestions={fetchUserSuggestions}
          />
        )}
        <Button type='submit' disabled={isProcessed || files.length === 0}>
          {getSubmitLabel(files.length, isProcessed)}
        </Button>
      </form>
    </PageContainer>
  )
}

const PageContainer = styled.div``

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