import styled from 'styled-components'
import { useDeletePhotoMutation } from '../model'
import { useNavigate, useLocation } from 'react-router'
import { EmptyObject, SubmitHandler, useForm } from 'react-hook-form'
import { Button, ErrMessage } from '@/shared/ui'

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
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (error: any) {
      setError('root', {
        message: error?.data?.message,
      })
    }
  }

  return (
    <PageContainer>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Button display='block' margin='1rem auto' disabled={isSubmitting}>
          Удалить
        </Button>
      </form>
    </PageContainer>
  )
}
