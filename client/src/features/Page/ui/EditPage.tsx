import styled from 'styled-components'
import { useChangePageMutation, useGetPageQuery } from '../model/pageSlice'
import { useLocation, useNavigate } from 'react-router'
import { Button, ErrMessage, Error, Field, Input, Loader, useLabeledFieldOutsideClick } from '@/shared/ui'
import { useEffect, useState } from 'react'
import z from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getErrorMessage } from '@/shared/utils'

interface IPageProps {
  url?: string
}

const PageContainer = styled.div``

const LoadingWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
`

const PageHeader = styled.h1`
  text-align: center;
`

const PageText = styled.div`
  text-align: center;
`

/** Keeps layout unchanged while exposing a label for `Field` + assistive tech. */
const VisuallyHiddenLabel = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

  const { data, isLoading, refetch } = useGetPageQuery(pageName)
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

  const titleFieldRef = useLabeledFieldOutsideClick(() => switchTitleEdited(false))
  const textFieldRef = useLabeledFieldOutsideClick(() => switchTextEdited(false))

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: data ?? { title: '', text: '' },
  })

  useEffect(() => {
    if (data) {
      reset(data)
    }
  }, [data, reset])

  const { title, text } = getValues()

  const onSubmit: SubmitHandler<FormFields> = async ({ title, text }) => {
    try {
      await changePage({
        name: pageName,
        data: { title, text },
      }).unwrap()
      navigate(location.pathname.replace('/edit', ''))
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError('root', {
        message,
      })
    }
  }

  if (isLoading && !data) {
    return (
      <PageContainer>
        <LoadingWrap>
          <Loader inline />
        </LoadingWrap>
      </PageContainer>
    )
  }

  if (!data) {
    return (
      <PageContainer>
        <Error
          title='Ошибка'
          message='Не удалось загрузить страницу'
          onRetry={() => {
            void refetch()
          }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        {isTitleEdited ? (
          <div ref={titleFieldRef}>
            <Field label={<VisuallyHiddenLabel>Заголовок страницы</VisuallyHiddenLabel>}>
              <Input {...register('title')} />
            </Field>
          </div>
        ) : (
          <PageHeader onClick={startTitleEdited}>{title}</PageHeader>
        )}
        {isTextEdited ? (
          <div ref={textFieldRef}>
            <Field label={<VisuallyHiddenLabel>Текст страницы</VisuallyHiddenLabel>}>
              <Input {...register('text')} />
            </Field>
          </div>
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
