import { useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../../components/Button'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { ErrMessage } from '../../components/ErrMessage'
import { formDensityVars, formStoryCardTag, formStoryPageTitle } from './formDensity'

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

const fieldWrapper: CSSProperties = {
  marginBottom: '10px',
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
          <div style={fieldWrapper}>
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
          </div>
          <div style={fieldWrapper}>
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
          </div>
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
          <div style={fieldWrapper}>
            <Field label="Имя пользователя" required>
              <Input name="username" defaultValue="demo_user" autoComplete="username" />
            </Field>
          </div>
          <div style={fieldWrapper}>
            <Field label="Пароль" required>
              <Input name="password" type="password" defaultValue="••••••••" autoComplete="current-password" />
            </Field>
          </div>
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
          <div style={fieldWrapper}>
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
          </div>
          <div style={fieldWrapper}>
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
          </div>
          <Button display="block" type="submit" margin="1.25rem auto 0">
            Войти
          </Button>
        </form>
      </section>
    )
  },
}

const sizeSectionLabel: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: '0 0 0.5rem',
}

const sizesStack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  maxWidth: 400,
  margin: '0 auto',
  padding: '1rem 1rem 2rem',
}

function LoginFilledCard({
  size,
  nameSuffix,
}: {
  size: 'sm' | 'md' | 'lg'
  nameSuffix: string
}) {
  return (
    <section style={{ ...card, ...formDensityVars[size] }}>
      <p style={{ ...sizeSectionLabel, ...formStoryCardTag[size] }}>
        {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} · {size}
      </p>
      <h1 style={{ ...title, ...formStoryPageTitle[size] }}>Вход</h1>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div style={fieldWrapper}>
          <Field label="Имя пользователя" required error="Пример ошибки поля">
            <Input
              name={`username-${nameSuffix}`}
              defaultValue="demo_user"
              autoComplete="username"
              size={size}
            />
          </Field>
        </div>
        <div style={fieldWrapper}>
          <Field label="Пароль" required>
            <Input
              name={`password-${nameSuffix}`}
              type="password"
              defaultValue="••••••••"
              autoComplete="current-password"
              size={size}
            />
          </Field>
        </div>
        <Button display="block" type="submit" margin="1.25rem auto 0" size={size}>
          Войти
        </Button>
      </form>
    </section>
  )
}

function LoginWithRootErrorCard({
  size,
  nameSuffix,
}: {
  size: 'sm' | 'md' | 'lg'
  nameSuffix: string
}) {
  return (
    <section style={{ ...card, ...formDensityVars[size] }}>
      <p style={{ ...sizeSectionLabel, ...formStoryCardTag[size] }}>
        {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} · {size}
      </p>
      <h1 style={{ ...title, ...formStoryPageTitle[size] }}>Вход</h1>
      <ErrMessage role="alert" size={size}>
        Неверное имя пользователя или пароль.
      </ErrMessage>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div style={fieldWrapper}>
          <Field label="Имя пользователя" required>
            <Input name={`username-err-${nameSuffix}`} defaultValue="" autoComplete="username" size={size} />
          </Field>
        </div>
        <div style={fieldWrapper}>
          <Field label="Пароль" required error="Пароль не может быть пустым">
            <Input
              name={`password-err-${nameSuffix}`}
              type="password"
              defaultValue=""
              autoComplete="current-password"
              size={size}
            />
          </Field>
        </div>
        <Button display="block" type="submit" margin="1.25rem auto 0" size={size}>
          Войти
        </Button>
      </form>
    </section>
  )
}

/** `sm` / `md` / `lg` on page title, card tag, Field labels, field errors, `ErrMessage`, inputs, and submit. */
export const Sizes: Story = {
  render: function SizesStory() {
    return (
      <div style={sizesStack}>
        <div>
          <h2 style={{ ...sizeSectionLabel, marginBottom: '1rem', fontSize: '0.8rem' }}>Заполненная форма</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <LoginFilledCard size="sm" nameSuffix="sm" />
            <LoginFilledCard size="md" nameSuffix="md" />
            <LoginFilledCard size="lg" nameSuffix="lg" />
          </div>
        </div>
        <div>
          <h2 style={{ ...sizeSectionLabel, marginBottom: '1rem', fontSize: '0.8rem' }}>С ошибкой входа</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <LoginWithRootErrorCard size="sm" nameSuffix="sm" />
            <LoginWithRootErrorCard size="md" nameSuffix="md" />
            <LoginWithRootErrorCard size="lg" nameSuffix="lg" />
          </div>
        </div>
      </div>
    )
  },
}
