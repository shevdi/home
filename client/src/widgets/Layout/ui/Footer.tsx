import styled from 'styled-components'

const Foot = styled.footer`
  background: linear-gradient(180deg, var(--nav-back-color-end) 0%, var(--nav-back-color) 100%);
  color: var(--nav-font-color);
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
`

const Copywrite = styled.div`
  color: inherit;
  margin: 0 auto;
  opacity: 0.9;
`

export function Footer() {
  return (
    <Foot>
      <Copywrite>© shevdi 2025</Copywrite>
    </Foot>
  )
}
