import { TypedUseQuery } from "@reduxjs/toolkit/query/react"

export function useQueries(queries: TypedUseQuery<any, void, any>[]) {
  const doneQueries = queries.map((item) => item())
  return {
    data: doneQueries.map((item) => item.data),
    error: doneQueries.find((item) => item.error),
    isLoading: doneQueries.some((item) => item.isLoading),
  }
}