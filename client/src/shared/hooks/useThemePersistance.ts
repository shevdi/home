import { useEffect } from "react"
import type { IConfig } from "../types"

export const useUserConfigPersistance = <K extends keyof IConfig>(key: K, theme: IConfig[K]) => {
  useEffect(() => {
    localStorage.setItem('config', JSON.stringify({ [key]: theme }))
  }, [key, theme])
}
