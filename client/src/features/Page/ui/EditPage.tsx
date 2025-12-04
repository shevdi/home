import styled from 'styled-components'
import { useChangePageMutation, useGetPageQuery } from '../model/pageSlice'
import { useLocation, useNavigate } from 'react-router'
import { Button, Input } from '@/shared/ui'
import { useEffect, useState } from 'react'

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

export function EditPage({ url }: IPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pageName = url || location.pathname.split('/')[1]

  const { data } = useGetPageQuery(pageName)
  const [changePage] = useChangePageMutation()

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [isTitleEdited, setIsTitleEdited] = useState(false)
  const [isTextEdited, setIsTextEdited] = useState(false)

  const switchTitleEdited = (value: boolean = false) => {
    setIsTitleEdited(value)
  }
  const switchTextEdited = (value: boolean = false) => setIsTextEdited(value)

  const startTitleEdited = () => {
    switchTitleEdited(true)
    switchTextEdited()
  }

  const startTextEdited = () => {
    switchTitleEdited()
    switchTextEdited(true)
  }

  useEffect(() => {
    if (data?.title) {
      setTitle(data.title)
    }
    if (data?.text) {
      setText(data.text)
    }
  }, [data?.title, data?.text])

  const handleTitleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleTextInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await changePage({
        name: pageName,
        data: { title, text },
      }).unwrap()
      navigate('/')
    } catch (err) {
      console.error('Failed to update page', err)
    }
  }

  return (
    <PageContainer>
      <form className='form' onSubmit={handleSubmit}>
        {isTitleEdited ? (
          <Input onOutsideClick={switchTextEdited} label='' value={title} required onChange={handleTitleInput} />
        ) : (
          <PageHeader onClick={startTitleEdited}>{title}</PageHeader>
        )}
        {isTextEdited ? (
          <Input label='' onOutsideClick={switchTextEdited} value={text} required onChange={handleTextInput} />
        ) : (
          <PageText onClick={startTextEdited}>{text}</PageText>
        )}
        <Button display='block' margin='1rem auto'>
          Сохранить
        </Button>
      </form>
    </PageContainer>
  )
}
