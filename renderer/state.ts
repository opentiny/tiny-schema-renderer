import { shallowReactive } from 'vue'
import { parseData } from './render'
import { getDeletedKeys, reset } from './dataUtils'
import type { GetContext } from './types'

interface UseStateOptions {
  getContext: GetContext
  registerStateAccessors: (data: Record<string, unknown>) => void
}

/**
 * 创建页面级 state 管理器。
 *
 * @param options - 配置项
 */
export function useState({ getContext, registerStateAccessors }: UseStateOptions) {
  const state = shallowReactive<Record<string, unknown>>({})

  /**
   * 将 schema.state 同步到运行时 state，并注册 accessor。
   *
   * @param data - schema.state 原始配置
   * @param clear - 是否全量清空后再写入（外部 API 兼容）
   */
  const setState = (data: Record<string, unknown>, clear?: boolean): void => {
    if (typeof data !== 'object' || data === null) {
      return
    }

    if (clear) {
      reset(state)
    } else {
      const deletedKeys = getDeletedKeys(state, data)
      for (const key of deletedKeys) {
        delete state[key]
      }
    }

    Object.assign(state, parseData(data, {}, getContext()) || {})
    registerStateAccessors(data)
  }

  return {
    state,
    setState
  }
}
