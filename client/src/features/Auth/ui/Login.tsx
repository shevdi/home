import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { setCredentials } from '../model/authSlice'
import { useLoginMutation } from '../model/authApiSlice'
import { Button, Input, Loader } from '@/shared/ui'

const Section = styled.section`
  max-width: 300px;
  margin: 0 auto;
`

const Head = styled.h1`
  text-align: center;
`

const ErrMassege = styled.div`
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  min-height: 1rem;
  margin-bottom: 1rem;
`

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [login, { isLoading }] = useLoginMutation()

  useEffect(() => {
    setErrMsg('')
  }, [username, password])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { accessToken } = await login({ username, password }).unwrap()

      dispatch(setCredentials({ accessToken }))
      setUsername('')
      setPassword('')
      navigate('/')
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (err: any) {
      if (err instanceof ErrorEvent) {
        return
      }
      if (!err.status) {
        setErrMsg('Нет ответа от сервера')
      } else if (err.status === 400) {
        setErrMsg('Необходимо заполнить все поля')
      } else if (err.status === 401) {
        setErrMsg('Неверное имя пользователя или пароль')
      } else {
        setErrMsg(err.data?.message)
      }
    }
  }

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)
  const handlePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)

  if (isLoading) return <Loader />

  return (
    <Section>
      <Head>Логин</Head>
      <ErrMassege>{errMsg}</ErrMassege>

      <form className='form' onSubmit={handleSubmit}>
        <Input label='Имя пользователя' value={username} focus required onChange={handleUserInput} />
        <Input label='Пароль' value={password} type='password' required onChange={handlePwdInput} />
        <Button display='block' margin='1rem auto'>
          Войти
        </Button>
      </form>
    </Section>
  )
}
