import { apiSlice } from "@/app/store/api"
import { logOut, setCredentials } from "./authSlice"
import { getErrorMessage } from "@/shared/utils"

export type TelegramWidgetUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export type TelegramVerifyResponse =
  | { accessToken: string }
  | { pendingTicket: string; suggestedName?: string }

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: '/auth',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    telegramVerify: builder.mutation<TelegramVerifyResponse, TelegramWidgetUser>({
      query: (body) => ({
        url: '/auth/telegram/verify',
        method: 'POST',
        body,
      }),
    }),
    telegramCompleteName: builder.mutation<{ accessToken: string }, { pendingTicket: string; name: string }>({
      query: (body) => ({
        url: '/auth/telegram/complete',
        method: 'POST',
        body,
      }),
    }),
    sendLogout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logOut())
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState())
          }, 1000)
        } catch (err) {
          console.log(getErrorMessage(err))
        }
      }
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'GET',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: { accessToken } } = await queryFulfilled
          dispatch(setCredentials({ accessToken }))
        } catch (err) {
          console.log(getErrorMessage(err))
        }
      }
    }),
  })
})

export const {
  useLoginMutation,
  useTelegramVerifyMutation,
  useTelegramCompleteNameMutation,
  useSendLogoutMutation,
  useRefreshMutation,
} = authApiSlice 
