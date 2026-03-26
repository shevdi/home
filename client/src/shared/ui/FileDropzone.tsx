import type { ReactNode } from 'react'
import styled from 'styled-components'

type DropzoneReturn = ReturnType<typeof import('react-dropzone').useDropzone>

export type FileDropzoneProps = Pick<DropzoneReturn, 'getRootProps' | 'getInputProps' | 'isDragActive'> & {
  disabled?: boolean
  children: ReactNode
  error?: string
}

export function FileDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  disabled = false,
  children,
  error,
}: FileDropzoneProps) {
  return (
    <Wrapper>
      <Area
        {...getRootProps()}
        $isDragActive={isDragActive}
        $disabled={disabled}
        data-disabled={disabled}
      >
        <input {...getInputProps()} />
        {children}
      </Area>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-bottom: 1rem;
`

const Area = styled.div<{ $isDragActive?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  border: 2px dashed
    ${({ $isDragActive, $disabled }) => ($isDragActive || $disabled ? 'var(--accent)' : 'var(--input-border)')};
  background: ${({ $isDragActive, $disabled }) =>
    $isDragActive || $disabled ? 'var(--input-disabled-color)' : 'var(--input-bg)'};
  color: var(--text-color);
  font-weight: 500;
  transition: all var(--transition-fast);

  &:hover:not([data-disabled='true']) {
    border-color: var(--accent);
    background: rgba(199, 107, 57, 0.08);
  }
`

const ErrorText = styled.div`
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--error-color);
  min-height: 1rem;
`
