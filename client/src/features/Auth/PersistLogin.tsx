import { Outlet } from 'react-router'
import { useEffect } from 'react'
import { useRefreshMutation } from './store/authApiSlice'

export const PersistLogin = () => {
  const [refresh] = useRefreshMutation()

  useEffect(() => {
    refresh({})
  }, [])

  return <Outlet />
}
