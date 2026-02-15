import styled from 'styled-components'
import { useDeletePhotoMutation } from '../model'
import { useNavigate, useLocation } from 'react-router'
import { EmptyObject, SubmitHandler, useForm } from 'react-hook-form'
import { Button, ErrMessage } from '@/shared/ui'
import { getErrorMessage } from '@/shared/utils'

const PageContainer = styled.div``

export function DeletePhoto() {
  const location = useLocation()
  const navigate = useNavigate()
  const photoId = location.pathname.split('/')[2]
  const [deletePhoto] = useDeletePhotoMutation()

  const {
    handleSubmit,
    setError,
    // getValues,
    formState: { isSubmitting, errors },
  } = useForm<EmptyObject>()

  const onSubmit: SubmitHandler<EmptyObject> = async () => {
    try {
      await deletePhoto({
        id: photoId,
      }).unwrap()
      navigate('/photos')
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError('root', {
        message,
      })
    }
  }

  return (
    <PageContainer>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Button display='block' margin='1rem auto' backgroundColor='var(--warning-color)' disabled={isSubmitting}>
          Удалить
        </Button>
      </form>
    </PageContainer>
  )
}
