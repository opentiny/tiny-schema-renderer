const JS_EXPRESSION = 'JSExpression' as const

export interface JSExpression {
  type: typeof JS_EXPRESSION
  value: string
  model?: boolean
  params?: string[]
}

export type RefPropValue = JSExpression | undefined | null

export interface RefBinding {
  expression: string
}

export interface RendererContext {
  state?: Record<string, unknown>
  [key: string]: unknown
}

export type RendererScope = Record<string, unknown>

export type NewFn = (...args: string[]) => (...callArgs: unknown[]) => unknown

export type RefCallback = (instance: unknown) => void

interface RefAssignScope extends RendererScope {
  __refInstance: unknown
  __refIndex?: number
}

const isJSExpression = (data: unknown): data is JSExpression =>
  typeof data === 'object' && data !== null && (data as JSExpression).type === JS_EXPRESSION

/**
 * 解析 props.ref，仅支持指向 state 的 JSExpression（如 this.state.formRef）
 */
export const resolveRefBinding = (ref: RefPropValue): RefBinding | null => {
  if (!isJSExpression(ref)) {
    return null
  }

  const expression = ref.value.trim()
  if (!expression) {
    return null
  }

  return { expression }
}

/**
 * 生成 Vue callback ref，将组件实例写入 state 中 ref 表达式指向的位置
 */
export const createRefSetter = (
  refBinding: RefBinding | null,
  scope: RendererScope,
  ctx: RendererContext,
  loopIndex: number | undefined,
  newFn: NewFn
): RefCallback | null => {
  if (!refBinding?.expression || !ctx.state) {
    return null
  }

  const { expression } = refBinding

  const runAssign = (instance: unknown) => {
    const mergeScope: RefAssignScope = {
      ...ctx,
      ...scope,
      slotScope: scope,
      __refInstance: instance,
      __refIndex: loopIndex
    }

    try {
      if (loopIndex !== undefined) {
        newFn(
          '$scope',
          `with($scope || {}) {
            if (!Array.isArray(${expression})) {
              ${expression} = []
            }
            const __target = ${expression}
            __target[__refIndex] = __refInstance
          }`
        ).call(ctx, mergeScope)
      } else {
        newFn(
          '$scope',
          `with($scope || {}) {
            ${expression} = __refInstance
          }`
        ).call(ctx, mergeScope)
      }
    } catch (error) {
      console.warn('[schema-renderer] ref assign failed:', expression, error)
    }
  }

  return (instance: unknown) => {
    runAssign(instance ?? null)
  }
}
