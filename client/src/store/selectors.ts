import { RootState } from "./store";

// check for request with Page tag that data is loading
export const getPending = (state: RootState) => Object.entries(state.api.queries).some((item) => {
  if (item && item[1]?.endpointName) {
    return item[1] && state.api.provided.tags?.Page && state.api.provided.tags?.Page[item[1].endpointName] && item[1].status === 'pending'
  } else {
    return true
  }
})

// check for request with Page tag that data is loading
export const getPageError = (state: RootState) => Object.entries(state.api.queries).some((item) => {
  if (item && item[1]?.endpointName) {
    console.log('item[1].error', item[1].error)
    return item[1] && state.api.provided.tags?.Page && state.api.provided.tags?.Page[item[1].endpointName] && item[1].error
  } else {
    return true
  }
})
