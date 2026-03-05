import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { setCredentials } from '../model/authSlice'
import { useLoginMutation } from '../model/authApiSlice'
import { Button, ErrMessage, Input } from '@/shared/ui'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getErrorMessage } from '@/shared/utils'

const schema = z.object({
  username: z.string().min(1, { error: 'Поле должно быть заполнено' }),
  password: z.string().min(1, { error: 'Поле должно быть заполнено' }),
})

type FormFields = z.infer<typeof schema>

export function Login() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [login] = useLoginMutation()

  const onSubmit: SubmitHandler<FormFields> = async ({ username, password }) => {
    try {
      const { accessToken } = await login({ username, password }).unwrap()
      dispatch(setCredentials({ accessToken }))
      navigate('/')
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError('root', {
        message,
      })
    }
  }

  return (
    <Section>
      <Head>Вход</Head>
      <ErrMessage>{errors.root?.message}</ErrMessage>

      <form className='form' onSubmit={handleSubmit(onSubmit)}>
        <Input
          label='Имя пользователя'
          {...register('username')}
          error={errors.username?.message}
          focus
          disabled={isSubmitting}
        />
        <Input
          label='Пароль'
          type='password'
          {...register('password')}
          error={errors.password?.message}
          disabled={isSubmitting}
        />
        <Button display='block' type='submit' margin='1.25rem auto 0' disabled={isSubmitting}>
          Войти
        </Button>
      </form>
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
