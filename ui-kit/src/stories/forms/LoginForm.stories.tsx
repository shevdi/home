import { useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../../components/Button/Button'
import { Field } from '../../components/Field/Field'
import { Input } from '../../components/Input/Input'
import { ErrMessage } from '../../components/ErrMessage/ErrMessage'

/**
 * Visual reference: client login screen (Field + Input + ErrMessage).
 * No RHF/validation — static demos only.
 */
const meta: Meta = {
  title: 'Forms/LoginForm',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof meta>

const card: CSSProperties = {
  maxWidth: 360,
  margin: '3rem auto',
  padding: '2rem',
  background: 'var(--surface-elevated)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid var(--input-border)',
}

const title: CSSProperties = {
  textAlign: 'center',
  fontSize: '1.5rem',
  margin: '0 0 1.5rem',
  fontWeight: 600,
}

const REQUIRED_MSG = 'Обязательное поле'

export const Empty: Story = {
  render: function EmptyStory() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [usernameError, setUsernameError] = useState<string | undefined>()
    const [passwordError, setPasswordError] = useState<string | undefined>()

    return (
      <section style={card}>
        <h1 style={title}>Вход</h1>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            const u = username.trim()
            const uErr = !u ? REQUIRED_MSG : undefined
            const pErr = !password ? REQUIRED_MSG : undefined
            setUsernameError(uErr)
            setPasswordError(pErr)
          }}
        >
          <Field label="Имя пользователя" required error={usernameError}>
            <Input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameError(undefined)
              }}
            />
          </Field>
          <Field label="Пароль" required error={passwordError}>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(undefined)
              }}
            />
          </Field>
          <Button display="block" type="submit" margin="1.25rem auto 0">
            Войти
          </Button>
        </form>
      </section>
    )
  },
}

export const Filled: Story = {
  render: function FilledStory() {
    return (
      <section style={card}>
        <h1 style={title}>Вход</h1>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <Field label="Имя пользователя" required>
            <Input name="username" defaultValue="demo_user" autoComplete="username" />
          </Field>
          <Field label="Пароль" required>
            <Input name="password" type="password" defaultValue="••••••••" autoComplete="current-password" />
          </Field>
          <Button display="block" type="submit" margin="1.25rem auto 0">
            Войти
          </Button>
        </form>
      </section>
    )
  },
}

export const WithRootError: Story = {
  render: function WithRootErrorStory() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [usernameError, setUsernameError] = useState<string | undefined>()
    const [passwordError, setPasswordError] = useState<string | undefined>()

    return (
      <section style={card}>
        <h1 style={title}>Вход</h1>
        <ErrMessage role="alert">Неверное имя пользователя или пароль.</ErrMessage>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            const u = username.trim()
            const uErr = !u ? REQUIRED_MSG : undefined
            const pErr = !password ? REQUIRED_MSG : undefined
            setUsernameError(uErr)
            setPasswordError(pErr)
          }}
        >
          <Field label="Имя пользователя" required error={usernameError}>
            <Input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameError(undefined)
              }}
            />
          </Field>
          <Field label="Пароль" required error={passwordError}>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(undefined)
              }}
            />
          </Field>
          <Button display="block" type="submit" margin="1.25rem auto 0">
            Войти
          </Button>
        </form>
      </section>
    )
  },
}
