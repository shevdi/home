import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { setCredentials } from '../model/authSlice'
import { useLoginMutation } from '../model/authApiSlice'
import { Button, ErrMessage, Input } from '@/shared/ui'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const Section = styled.section`
  max-width: 300px;
  margin: 0 auto;
`

const Head = styled.h1`
  text-align: center;
`

const schema = z.object({
  username: z.string().nonempty('Поле должно быть заполнено'),
  password: z.string().nonempty('Поле должно быть заполнено'),
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
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (error: any) {
      setError('root', {
        message: error?.data?.message,
      })
    }
  }

  return (
    <Section>
      <Head>Логин</Head>
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
        <Button display='block' type='submit' margin='1rem auto' disabled={isSubmitting}>
          Войти
        </Button>
      </form>
    </Section>
  )
}
