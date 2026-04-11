import styled from 'styled-components'
import { useState } from 'react'
import { PasswordLogin, TelegramLogin } from '@/features/Auth'
import { useTitle } from '@/shared/hooks'

export function LoginPage() {
  useTitle('Логин')
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? '').trim()
  const [telegramChooseName, setTelegramChooseName] = useState(false)

  return (
    <Section>
      {!telegramChooseName && (
        <>
          <Head>Вход</Head>
          <PasswordLogin />
          {botUsername ? <Divider>или</Divider> : null}
        </>
      )}
      {botUsername ? (
        <TelegramLogin
          chooseNameActive={telegramChooseName}
          onChooseNameActiveChange={setTelegramChooseName}
        />
      ) : null}
    </Section>
  )
}

const Section = styled.section`
  max-width: 360px;
  margin: 3rem auto;
  padding: 2rem;
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--input-border);
`

const Head = styled.h1`
  text-align: center;
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
`

const Divider = styled.p`
  text-align: center;
  margin: 1.5rem 0 1rem;
  font-size: 0.875rem;
  color: var(--text-muted, #666);
`
