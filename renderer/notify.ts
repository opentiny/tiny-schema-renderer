import { NOTIFY } from './useContext'

export type NotifyType = 'success' | 'warning' | 'error' | 'info'

export interface NotifyOptions {
  type?: NotifyType
  title?: string
  message?: string
  duration?: number
}

export type NotifyHandler = (options: NotifyOptions) => void

export { NOTIFY }

const ROOT_ID = 'genui-notify-root'
const STYLE_ID = 'genui-notify-style'
const DEFAULT_DURATION = 3000

const TYPE_COLOR: Record<NotifyType, string> = {
  success: '#67c23a',
  warning: '#e6a23c',
  error: '#f56c6c',
  info: '#909399',
}

function fallback(options: NotifyOptions): void {
  console.warn('[Notify]', options)
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
#${ROOT_ID}{position:fixed;top:16px;right:16px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.genui-notify{pointer-events:auto;min-width:240px;max-width:360px;padding:12px 16px;border-radius:4px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.12);border-left:4px solid #909399;font:14px/1.4 system-ui,sans-serif;color:#303133;opacity:1;transition:opacity .2s}
.genui-notify__title{font-weight:600;margin-bottom:4px}
.genui-notify__close{float:right;border:0;background:transparent;cursor:pointer;color:#909399;font-size:16px;line-height:1;padding:0 0 0 8px}
.genui-notify--success{border-left-color:${TYPE_COLOR.success}}
.genui-notify--warning{border-left-color:${TYPE_COLOR.warning}}
.genui-notify--error{border-left-color:${TYPE_COLOR.error}}
.genui-notify--info{border-left-color:${TYPE_COLOR.info}}
.genui-notify--leaving{opacity:0}
`
  document.head.appendChild(style)
}

function ensureRoot(): HTMLElement {
  let root = document.getElementById(ROOT_ID)
  if (!root) {
    root = document.createElement('div')
    root.id = ROOT_ID
    document.body.appendChild(root)
  }
  return root
}

function createToastElement(options: NotifyOptions): HTMLElement {
  const type: NotifyType = options.type ?? 'info'
  const el = document.createElement('div')
  el.className = `genui-notify genui-notify--${type}`
  el.setAttribute('role', 'alert')

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'genui-notify__close'
  closeBtn.setAttribute('aria-label', 'close')
  closeBtn.textContent = '×'

  if (options.title) {
    const title = document.createElement('div')
    title.className = 'genui-notify__title'
    title.textContent = options.title
    el.appendChild(title)
  }
  if (options.message) {
    const msg = document.createElement('div')
    msg.className = 'genui-notify__message'
    msg.textContent = options.message
    el.appendChild(msg)
  }

  el.insertBefore(closeBtn, el.firstChild)
  return el
}

function bindAutoDismiss(el: HTMLElement, duration: number, closeBtn: HTMLButtonElement): void {
  let timer: ReturnType<typeof setTimeout> | undefined
  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }
  const remove = () => {
    clearTimer()
    el.classList.add('genui-notify--leaving')
    setTimeout(() => el.remove(), 200)
  }
  const scheduleRemove = () => {
    clearTimer()
    if (duration > 0) {
      timer = setTimeout(remove, duration)
    }
  }
  closeBtn.addEventListener('click', remove)
  el.addEventListener('mouseenter', clearTimer)
  el.addEventListener('mouseleave', scheduleRemove)
  scheduleRemove()
}

function showDomToast(options: NotifyOptions): void {
  ensureStyle()
  const el = createToastElement(options)
  const closeBtn = el.querySelector('.genui-notify__close') as HTMLButtonElement
  ensureRoot().appendChild(el)
  bindAutoDismiss(el, options.duration ?? DEFAULT_DURATION, closeBtn)
}

export function Notify(options: NotifyOptions, ctx?: Record<PropertyKey, any>): void {
  try {
    const custom = ctx?.[NOTIFY] as NotifyHandler | undefined
    if (custom) {
      custom(options)
      return
    }
    if (typeof document === 'undefined') {
      fallback(options)
      return
    }
    showDomToast(options)
  } catch {
    fallback(options)
  }
}
