import { useGetWelcomePageQuery } from './store/welcomeSlice'

export function WelcomePage() {
  const { data } = useGetWelcomePageQuery()

  return <div>{<h1>{data?.title}</h1>}</div>
}
