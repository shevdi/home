import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { setCredentials } from '../model/authSlice'
import { useLoginMutation } from '../model/authApiSlice'
import { Button, ErrMessage, Field, Input } from '@/shared/ui'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getErrorMessage } from '@/shared/utils'

const passwordSchema = z.object({
  username: z.string().min(1, { error: 'Поле должно быть заполнено' }),
  password: z.string().min(1, { error: 'Поле должно быть заполнено' }),
})

type PasswordFields = z.infer<typeof passwordSchema>

export function PasswordLogin() {
  const passwordForm = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [login] = useLoginMutation()

  const onPasswordSubmit: SubmitHandler<PasswordFields> = async ({ username, password }) => {
    try {
      const { accessToken } = await login({ username, password }).unwrap()
      dispatch(setCredentials({ accessToken }))
      navigate('/')
    } catch (error: unknown) {
      passwordForm.setError('root', { message: getErrorMessage(error) })
    }
  }

  const rootMessage = passwordForm.formState.errors.root?.message

  return (
    <>
      <ErrMessage {...(rootMessage ? { 'data-testid': 'password-login-error', role: 'alert' } : {})}>
        {rootMessage}
      </ErrMessage>
      <form className='form' onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <Field label='Имя пользователя' error={passwordForm.formState.errors.username?.message} required>
          <Input focus {...passwordForm.register('username')} disabled={passwordForm.formState.isSubmitting} />
        </Field>
        <Field label='Пароль' error={passwordForm.formState.errors.password?.message} required>
          <Input
            type='password'
            {...passwordForm.register('password')}
            disabled={passwordForm.formState.isSubmitting}
          />
        </Field>
        <Button display='block' type='submit' margin='1.25rem auto 0' disabled={passwordForm.formState.isSubmitting}>
          Войти
        </Button>
      </form>
    </>
  )
}
