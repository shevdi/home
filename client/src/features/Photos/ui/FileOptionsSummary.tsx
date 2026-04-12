import styled from 'styled-components'
import type { PerFileOptions } from '../utils/perFileOptions'

type FileOptionsSummaryProps = {
  options: PerFileOptions
}

export const FileOptionsSummary = ({ options }: FileOptionsSummaryProps) => {
  const parts: string[] = []

  if (options.private) parts.push('скрыто')
  if (options.title) parts.push(options.title)
  if (options.country.length > 0) parts.push(options.country.join(', '))
  if (options.city.length > 0) parts.push(options.city.join(', '))
  if (options.tags.length > 0) parts.push(options.tags.join(', '))
  if (options.priority !== 0) parts.push(`приоритет: ${options.priority}`)
  if (options.accessedBy.length > 0) parts.push(`доступ: ${options.accessedBy.length}`)

  if (parts.length === 0) return null

  return <SummaryText>{parts.join(' · ')}</SummaryText>
}

const SummaryText = styled.span`
  display: block;
  color: var(--accent);
  font-size: 0.8em;
  margin-top: 0.15rem;
`
