import { useGetWelcomePageQuery } from './store/welcomeSlice'

export function Welcome() {
  const { data, error, isLoading } = useGetWelcomePageQuery()
  if (error) {
    return <div>Ошибка</div>
  }
  if (isLoading || !data) {
    return <div>ждём</div>
  }

  return <div>{<h1>{data.title}</h1>}</div>
}
