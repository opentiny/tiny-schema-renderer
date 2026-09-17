import { RENDERER_SETTINGS } from './useContext'
import { showDomToast, fallbackNotify } from './notify-dom'

export type NotifyType = 'success' | 'warning' | 'error' | 'info'

export interface NotifyOptions {
  type?: NotifyType
  title?: string
  message?: string
  duration?: number
}

export type NotifyHandler = (options: NotifyOptions) => void

export function Notify(options: NotifyOptions, ctx?: Record<PropertyKey, any>): void {
  try {
    const custom = ctx?.[RENDERER_SETTINGS]?.notify as NotifyHandler | undefined
    if (typeof custom === 'function') {
      custom(options)
      return
    }
    if (typeof document === 'undefined') {
      fallbackNotify(options)
      return
    }
    showDomToast(options)
  } catch {
    fallbackNotify(options)
  }
}
