import { Outlet } from 'react-router'
import { useEffect } from 'react'
import { useRefreshMutation } from '../model/authApiSlice'

export const PersistLogin = () => {
  const [refresh] = useRefreshMutation()

  useEffect(() => {
    refresh({})
  }, [refresh])

  return <Outlet />
}
