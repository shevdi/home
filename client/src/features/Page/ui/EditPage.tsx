import styled from 'styled-components'
import { useChangePageMutation, useGetPageQuery } from '../model/pageSlice'
import { useLocation, useNavigate } from 'react-router'
import { Button, ErrMessage, Input } from '@/shared/ui'
import { useState } from 'react'
import z from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface IPageProps {
  url?: string
}

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const PageText = styled.div`
  text-align: center;
`

const schema = z.object({
  title: z.string(),
  text: z.string(),
})

type FormFields = z.infer<typeof schema>

export function EditPage({ url }: IPageProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const pageName = url || location.pathname.split('/')[1]

  const { data } = useGetPageQuery(pageName)
  const [changePage] = useChangePageMutation()

  const [isTitleEdited, setIsTitleEdited] = useState(false)
  const [isTextEdited, setIsTextEdited] = useState(false)

  const switchTitleEdited = (value: boolean = false) => setIsTitleEdited(value)
  const switchTextEdited = (value: boolean = false) => setIsTextEdited(value)

  const startTitleEdited = () => {
    switchTitleEdited(true)
    switchTextEdited(false)
  }

  const startTextEdited = () => {
    switchTextEdited(true)
    switchTitleEdited(false)
  }

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  const { title, text } = getValues()

  const onSubmit: SubmitHandler<FormFields> = async ({ title, text }) => {
    try {
      await changePage({
        name: pageName,
        data: { title, text },
      }).unwrap()
      navigate(location.pathname.replace('/edit', ''))
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (error: any) {
      setError('root', {
        message: error?.data?.message,
      })
    }
  }

  return (
    <PageContainer>
      <form className='form' onSubmit={handleSubmit(onSubmit)}>
        {isTitleEdited ? (
          <Input label='' onOutsideClick={switchTitleEdited} {...register('title')} />
        ) : (
          <PageHeader onClick={startTitleEdited}>{title}</PageHeader>
        )}
        {isTextEdited ? (
          <Input label='' onOutsideClick={switchTextEdited} {...register('text')} />
        ) : (
          <PageText onClick={startTextEdited}>{text}</PageText>
        )}
        <ErrMessage>{errors.root?.message}</ErrMessage>
        <Button display='block' margin='1rem auto' disabled={isSubmitting}>
          Сохранить
        </Button>
      </form>
    </PageContainer>
  )
}
