/**
 * Schema 协议中的 JSFunction 描述符。
 */
export interface JSFunctionDescriptor {
  type: 'JSFunction'
  value: string
}

/**
 * 带 getter/setter 的状态访问器配置。
 */
export interface StateAccessorConfig {
  accessor?: {
    getter?: JSFunctionDescriptor
    setter?: JSFunctionDescriptor
  }
  defaultValue?: unknown
}

/**
 * 页面运行时上下文。
 */
export type PageContext = Record<string, unknown>

/**
 * 获取页面运行时上下文的函数。
 */
export type GetContext = () => PageContext
