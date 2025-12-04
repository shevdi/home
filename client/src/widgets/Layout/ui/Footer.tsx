import styled from 'styled-components'

const Foot = styled.footer`
  background-color: var(--nav-back-color);
  color: var(--nav-font-color);
  padding: 1rem;
  text-align: center;
`

const Copywrite = styled.div`
  color: inherit;
  margin: 0 auto;
`

export function Footer() {
  return (
    <Foot>
      <Copywrite>©shevdi 2025</Copywrite>
    </Foot>
  )
}
