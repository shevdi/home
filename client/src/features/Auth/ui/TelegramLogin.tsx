import styled from 'styled-components'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { setCredentials } from '../model/authSlice'
import {
  useTelegramCompleteNameMutation,
  useTelegramVerifyMutation,
  type TelegramWidgetUser,
} from '../model/authApiSlice'
import { Button, ErrMessage, Field, Input } from '@/shared/ui'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getErrorMessage } from '@/shared/utils'

const nameSchema = z.object({
  displayName: z.string().min(1, { error: 'Имя пользователя обязательно' }),
})

type NameFields = z.infer<typeof nameSchema>

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetUser) => void
  }
}

export type TelegramLoginProps = {
  chooseNameActive: boolean
  onChooseNameActiveChange: (active: boolean) => void
}

export function TelegramLogin({ chooseNameActive, onChooseNameActiveChange }: TelegramLoginProps) {
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? '').trim()
  const telegramMountRef = useRef<HTMLDivElement>(null)
  const telegramScriptAttached = useRef(false)

  const [pendingTicket, setPendingTicket] = useState<string | null>(null)
  const [widgetError, setWidgetError] = useState<string | undefined>()

  const nameForm = useForm<NameFields>({
    resolver: zodResolver(nameSchema),
    defaultValues: { displayName: '' },
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [verifyTelegram] = useTelegramVerifyMutation()
  const [completeTelegramName] = useTelegramCompleteNameMutation()

  const handleTelegramUser = useCallback(
    async (user: TelegramWidgetUser) => {
      setWidgetError(undefined)
      try {
        const data = await verifyTelegram(user).unwrap()
        if ('accessToken' in data) {
          dispatch(setCredentials({ accessToken: data.accessToken }))
          navigate('/')
          return
        }
        setPendingTicket(data.pendingTicket)
        nameForm.reset({ displayName: data.suggestedName ?? '' })
        onChooseNameActiveChange(true)
      } catch (error: unknown) {
        setWidgetError(getErrorMessage(error))
      }
    },
    [verifyTelegram, dispatch, navigate, nameForm, onChooseNameActiveChange],
  )

  useEffect(() => {
    window.onTelegramAuth = handleTelegramUser
    return () => {
      if (window.onTelegramAuth === handleTelegramUser) {
        delete window.onTelegramAuth
      }
    }
  }, [handleTelegramUser])

  useLayoutEffect(() => {
    if (!botUsername || telegramScriptAttached.current) {
      console.log('Telegram login widget not attached', botUsername, !!telegramScriptAttached.current)
      return
    }
    const container = telegramMountRef.current
    if (!container) {
      console.log('Telegram bot container not found')
      return
    }
    telegramScriptAttached.current = true
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    container.appendChild(script)
  }, [botUsername])

  const onNameSubmit: SubmitHandler<NameFields> = async ({ displayName }) => {
    if (!pendingTicket) {
      return
    }
    try {
      const { accessToken } = await completeTelegramName({
        pendingTicket,
        name: displayName.trim(),
      }).unwrap()
      dispatch(setCredentials({ accessToken }))
      navigate('/')
    } catch (error: unknown) {
      const err = error as { status?: number; data?: { code?: string; message?: string } }
      if (err?.status === 409 && err?.data?.code === 'NAME_CONFLICT') {
        nameForm.setError('displayName', { message: err.data?.message ?? 'Это имя уже занято' })
        return
      }
      nameForm.setError('root', { message: getErrorMessage(error) })
    }
  }

  if (!botUsername) {
    return null
  }

  return (
    <>
      {!chooseNameActive && widgetError ? <ErrMessage>{widgetError}</ErrMessage> : null}
      <TelegramHost ref={telegramMountRef} data-testid='telegram-login-widget-host' $hidden={chooseNameActive} />
      {chooseNameActive ? (
        <>
          <NameHead>Имя пользователя</NameHead>
          <Sub>Введите имя для входа в приложение</Sub>
          <ErrMessage>{nameForm.formState.errors.root?.message}</ErrMessage>
          <form className='form' onSubmit={nameForm.handleSubmit(onNameSubmit)}>
            <Field label='Имя пользователя' error={nameForm.formState.errors.displayName?.message} required>
              <Input focus {...nameForm.register('displayName')} disabled={nameForm.formState.isSubmitting} />
            </Field>
            <Button display='block' type='submit' margin='1.25rem auto 0' disabled={nameForm.formState.isSubmitting}>
              Продолжить
            </Button>
          </form>
        </>
      ) : null}
    </>
  )
}

const TelegramHost = styled.div<{ $hidden?: boolean }>`
  display: ${(p) => (p.$hidden ? 'none' : 'flex')};
  justify-content: center;
  min-height: 44px;
`

const NameHead = styled.h1`
  text-align: center;
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
`

const Sub = styled.p`
  text-align: center;
  margin: -1rem 0 1.25rem;
  color: var(--text-muted, #666);
  font-size: 0.9rem;
`
