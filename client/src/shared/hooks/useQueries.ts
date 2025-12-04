import { TypedUseQuery } from "@reduxjs/toolkit/query/react"

/* eslint @typescript-eslint/no-explicit-any: "off" */
export function useQueries(queries: TypedUseQuery<any, void, any>[]) {
  const doneQueries = queries.map((item) => item())
  return {
    data: doneQueries.map((item) => item.data),
    error: doneQueries.find((item) => item.error),
    isLoading: doneQueries.some((item) => item.isLoading),
  }
}