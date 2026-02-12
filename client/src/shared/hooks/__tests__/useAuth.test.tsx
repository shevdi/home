import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/Auth/model/authSlice'
import { setCredentials, logOut } from '@/features/Auth'
import { useAuth } from '../useAuth'

function createTestToken(payload: { username: string; roles: string[] }) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ UserInfo: payload }))
  return `${header}.${body}.signature`
}

function createWrapper(initialToken: string | null = null) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: initialToken
      ? { auth: { token: initialToken } }
      : undefined,
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useAuth', () => {
  it('returns empty auth when no token', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current).toEqual({
      username: '',
      roles: [],
      status: '',
      isUser: false,
      isAdmin: false,
    })
  })

  it('returns user auth when token has user role', () => {
    const token = createTestToken({ username: 'johndoe', roles: ['user'] })
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(token),
    })

    expect(result.current).toEqual({
      username: 'johndoe',
      roles: ['user'],
      status: 'user',
      isUser: true,
      isAdmin: false,
    })
  })

  it('returns admin auth when token has admin role', () => {
    const token = createTestToken({ username: 'admin', roles: ['admin'] })
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(token),
    })

    expect(result.current).toEqual({
      username: 'admin',
      roles: ['admin'],
      status: 'admin',
      isUser: false,
      isAdmin: true,
    })
  })

  it('returns admin auth when token has both user and admin roles', () => {
    const token = createTestToken({
      username: 'superuser',
      roles: ['user', 'admin'],
    })
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(token),
    })

    expect(result.current).toEqual({
      username: 'superuser',
      roles: ['user', 'admin'],
      status: 'admin',
      isUser: true,
      isAdmin: true,
    })
  })

  it('updates when token changes via setCredentials', () => {
    const store = configureStore({ reducer: { auth: authReducer } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result, rerender } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.username).toBe('')
    expect(result.current.isUser).toBe(false)

    const token = createTestToken({ username: 'newuser', roles: ['user'] })
    act(() => {
      store.dispatch(setCredentials({ accessToken: token }))
    })
    rerender({})

    expect(result.current).toEqual({
      username: 'newuser',
      roles: ['user'],
      status: 'user',
      isUser: true,
      isAdmin: false,
    })
  })

  it('clears auth when token is removed via logOut', () => {
    const token = createTestToken({ username: 'johndoe', roles: ['user'] })
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { token } },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result, rerender } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.username).toBe('johndoe')

    act(() => {
      store.dispatch(logOut())
    })
    rerender({})

    expect(result.current).toEqual({
      username: '',
      roles: [],
      status: '',
      isUser: false,
      isAdmin: false,
    })
  })
})
