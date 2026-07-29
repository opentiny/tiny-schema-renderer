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
const STYLE_ID = 'genui-notify-style-v3'
const DEFAULT_DURATION = 4500
const ANIM_MS = 300

const TYPE_COLOR: Record<NotifyType, string> = {
  success: '#67c23a',
  warning: '#e6a23c',
  error: '#f56c6c',
  info: '#909399',
}

const TYPE_ICON: Record<NotifyType, string> = {
  success:
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.5 12.5l3 3 6-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warning:
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 7v6" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="#fff"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
  info: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 10.5V17" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.2" fill="#fff"/></svg>',
}

function fallback(options: NotifyOptions): void {
  console.warn('[Notify]', options)
}

function ensureStyle(): void {
  document.getElementById('genui-notify-style-v2')?.remove()
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
#${ROOT_ID}{position:fixed;top:16px;right:16px;z-index:10000;display:flex;flex-direction:column;pointer-events:none;width:330px;max-width:calc(100vw - 32px)}
.genui-notify{pointer-events:auto;display:flex;align-items:flex-start;gap:12px;width:100%;box-sizing:border-box;padding:14px 16px;margin:0 0 12px;border-radius:8px;background:#fff;border:1px solid #ebeef5;box-shadow:0 6px 16px 0 rgba(0,0,0,.08),0 3px 6px -4px rgba(0,0,0,.12),0 9px 28px 8px rgba(0,0,0,.05);font:14px/1.4 system-ui,-apple-system,sans-serif;color:#303133;opacity:0;transform:translateX(100%);overflow:hidden;transition:opacity ${ANIM_MS}ms ease,transform ${ANIM_MS}ms ease,height ${ANIM_MS}ms ease,padding ${ANIM_MS}ms ease,margin ${ANIM_MS}ms ease,border-width ${ANIM_MS}ms ease}
.genui-notify--enter{opacity:1;transform:translateX(0)}
.genui-notify--leaving{opacity:0;transform:translateY(-12px);padding-top:0;padding-bottom:0;margin-bottom:0;border-width:0}
.genui-notify__icon{flex:none;width:24px;height:24px;margin-top:1px;line-height:0}
.genui-notify__icon svg{display:block}
.genui-notify__body{flex:1;min-width:0}
.genui-notify__title{font-weight:600;font-size:16px;line-height:24px;color:#303133}
.genui-notify__message{margin-top:4px;font-size:14px;line-height:1.5;color:#606266;word-break:break-word}
.genui-notify__close{flex:none;margin:-4px -6px 0 0;border:0;background:transparent;cursor:pointer;color:#909399;font-size:18px;line-height:1;padding:4px;border-radius:4px}
.genui-notify__close:hover{color:#606266;background:#f5f7fa}
.genui-notify--success .genui-notify__icon{color:${TYPE_COLOR.success}}
.genui-notify--warning .genui-notify__icon{color:${TYPE_COLOR.warning}}
.genui-notify--error .genui-notify__icon{color:${TYPE_COLOR.error}}
.genui-notify--info .genui-notify__icon{color:${TYPE_COLOR.info}}
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

  const icon = document.createElement('div')
  icon.className = 'genui-notify__icon'
  icon.innerHTML = TYPE_ICON[type]

  const body = document.createElement('div')
  body.className = 'genui-notify__body'
  if (options.title) {
    const title = document.createElement('div')
    title.className = 'genui-notify__title'
    title.textContent = options.title
    body.appendChild(title)
  }
  if (options.message) {
    const msg = document.createElement('div')
    msg.className = 'genui-notify__message'
    msg.textContent = options.message
    body.appendChild(msg)
  }

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'genui-notify__close'
  closeBtn.setAttribute('aria-label', 'close')
  closeBtn.textContent = '×'

  el.append(icon, body, closeBtn)
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
    if (el.classList.contains('genui-notify--leaving')) return
    el.style.height = `${el.offsetHeight}px`
    void el.offsetHeight
    el.classList.remove('genui-notify--enter')
    el.classList.add('genui-notify--leaving')
    el.style.height = '0'
    setTimeout(() => el.remove(), ANIM_MS)
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
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('genui-notify--enter'))
  })
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
