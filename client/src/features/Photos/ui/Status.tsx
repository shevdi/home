import styled, { keyframes } from 'styled-components'
import { Link } from 'react-router'
import type { UploadFileStatus } from '../model/uploadSlice'

const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`

const StatusIcon = styled.span<{ $status: UploadFileStatus }>`
  flex-shrink: 0;
  font-size: 1rem;
  line-height: 1;
  color: ${({ $status }) =>
    $status === 'success' ? 'var(--success-color, #2e7d32)' : $status === 'error' ? 'var(--error-color)' : 'inherit'};
`

const DotsAnimation = styled.span`
  display: inline-flex;
  gap: 2px;

  span {
    animation: ${dotPulse} 1.4s ease-in-out infinite both;
    font-size: 0.8em;
  }
  span:nth-child(1) {
    animation-delay: 0s;
  }
  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }
`

export const OpenLink = styled(Link)`
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ErrorText = styled.span`
  color: var(--error-color);
  font-size: 0.85em;
`

type StatusProps = {
  status?: UploadFileStatus
  photoId?: string
  error?: string
}

export const Status = ({ status, photoId, error }: StatusProps) => {
  if (!status || status === 'pending') return null
  if (status === 'uploading') {
    return (
      <DotsAnimation>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </DotsAnimation>
    )
  }
  if (status === 'success' && photoId) {
    return (
      <>
        <StatusIcon $status='success' aria-hidden>
          ✓
        </StatusIcon>
        <OpenLink to={`/photos/${photoId}`}>Открыть</OpenLink>
      </>
    )
  }
  if (status === 'error') {
    return (
      <>
        <StatusIcon $status='error' aria-hidden>
          ✗
        </StatusIcon>
        {error && <ErrorText>{error}</ErrorText>}
      </>
    )
  }
  return null
}
