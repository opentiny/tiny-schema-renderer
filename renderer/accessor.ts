import { watchEffect, type WatchStopHandle } from 'vue'
import { parseData, isStateAccessor } from './render'
import type { GetContext, StateAccessorConfig } from './types'

type AccessorType = 'getter' | 'setter'

interface AccessorDescriptor {
  getter?: { value?: string }
  setter?: { value?: string }
  [key: string]: unknown
}

/**
 * 创建状态访问器管理器，用于注册 getter/setter 的 watchEffect 监听。
 *
 * @param getContext - 获取页面运行时上下文
 */
export function useAccessorMap(getContext: GetContext) {
  const stateAccessorMap = new Map<string, WatchStopHandle>()

  /**
   * 解析 accessor 中的 getter 或 setter 为可执行函数。
   *
   * @param type - 访问器类型
   * @param accessor - 访问器配置
   * @param property - 状态变量名
   */
  const generateAccessor = (type: AccessorType, accessor: AccessorDescriptor, property: string) => {
    const accessorFn = parseData(accessor[type], {}, getContext())

    return { property, accessorFn, type }
  }

  /**
   * 为指定状态变量注册 getter 或 setter 的 watchEffect 监听。
   * schema 更新时会先取消同 key 的旧监听，避免重复注册造成数据混乱。
   *
   * @param type - 访问器类型
   * @param accessor - 访问器配置
   * @param key - 状态变量名
   */
  const generateStateAccessors = (type: AccessorType, accessor: AccessorDescriptor, key: string): void => {
    const stateWatchEffectKey = `${key}${type}`
    const { property, accessorFn } = generateAccessor(type, accessor, key)

    if (typeof accessorFn !== 'function') {
      console.warn(`状态变量 ${property} 的 ${type} 解析失败，跳过注册`)
      return
    }

    stateAccessorMap.get(stateWatchEffectKey)?.()

    stateAccessorMap.set(
      stateWatchEffectKey,
      watchEffect(() => {
        try {
          accessorFn()
        } catch (error) {
          console.warn(`状态变量 ${property} 的访问器函数执行报错`, error)
        }
      })
    )
  }

  /**
   * 取消所有已注册的状态访问器监听。
   */
  const clearStateAccessors = (): void => {
    stateAccessorMap.forEach((stop) => stop())
    stateAccessorMap.clear()
  }

  /**
   * 遍历 state 配置，为带 accessor 的字段注册 getter/setter 监听。
   *
   * @param data - schema.state 原始配置
   */
  const registerStateAccessors = (data: Record<string, StateAccessorConfig | unknown>): void => {
    Object.entries(data || {}).forEach(([key, stateData]) => {
      if (!isStateAccessor(stateData)) {
        return
      }

      const accessor = (stateData as StateAccessorConfig).accessor

      if (accessor?.getter?.value) {
        generateStateAccessors('getter', accessor, key)
      }

      if (accessor?.setter?.value) {
        generateStateAccessors('setter', accessor, key)
      }
    })
  }

  return {
    generateStateAccessors,
    clearStateAccessors,
    registerStateAccessors
  }
}
