import styled from 'styled-components'

export function PrivateBadge() {
  return (
    <Badge aria-label='Private photo' title='Private photo'>
      <Icon viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
        <path
          d='M3 12c1.8-3.6 5.1-6 9-6 1.8 0 3.4.5 4.8 1.3l-1.4 1.4A6 6 0 0 0 12 8c-3 0-5.7 1.8-7.2 4 1 1.5 2.4 2.7 4.1 3.4l-1.5 1.5C5.5 15.9 4 14.1 3 12Zm10.1 3.1 2.6-2.6c.2-.4.3-.9.3-1.5a3 3 0 0 0-3-3c-.6 0-1.1.1-1.5.3l2.6-2.6A5 5 0 0 1 17 11a5 5 0 0 1-3.9 4.1ZM4.3 3 3 4.3l4.1 4.1C5.6 9.4 4.1 10.9 3 12c1.8 3.6 5.1 6 9 6 1.6 0 3.1-.3 4.5-.9l3.2 3.2 1.3-1.3L4.3 3ZM12 16a4 4 0 0 1-4-4c0-.5.1-.9.2-1.3l5.1 5.1c-.4.1-.8.2-1.3.2Z'
          fill='currentColor'
        />
      </Icon>
    </Badge>
  )
}

const Badge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  pointer-events: none;
`

const Icon = styled.svg`
  width: 18px;
  height: 18px;
`
