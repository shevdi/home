import { IPhotoSearchParams } from "../types"

export const buildSearchParams = (search?: IPhotoSearchParams | void, pageParam?: number) => {
  const params = new URLSearchParams()
  if (pageParam !== undefined) {
    params.append('page', pageParam.toString())
  }
  if (search?.dateFrom) {
    params.append('dateFrom', search.dateFrom)
  }
  if (search?.dateTo) {
    params.append('dateTo', search.dateTo)
  }
  if (search?.order) {
    params.append('order', search.order)
  }
  if (search?.tags && search.tags.length > 0) {
    params.append('tags', search.tags.join(','))
  }
  return params.toString()
}
