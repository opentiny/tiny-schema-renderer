const JS_EXPRESSION = 'JSExpression'

const isJSExpression = (data) => data && data.type === JS_EXPRESSION

/**
 * 解析 props.ref，仅支持指向 state 的 JSExpression（如 this.state.formRef）
 * @param {import('./render').PropValue | undefined} ref
 * @returns {{ expression: string } | null}
 */
export const resolveRefBinding = (ref) => {
  if (!isJSExpression(ref)) {
    return null
  }

  const expression = ref.value?.trim()
  if (!expression) {
    return null
  }

  return { expression }
}

/**
 * 生成 Vue callback ref，将组件实例写入 state 中 ref 表达式指向的位置
 * @param {{ expression: string } | null} refBinding
 * @param {Record<string, any>} scope
 * @param {Record<string, any>} ctx
 * @param {number | undefined} loopIndex
 * @param {typeof import('./render').newFn} newFn
 */
export const createRefSetter = (refBinding, scope, ctx, loopIndex, newFn) => {
  if (!refBinding?.expression || !ctx?.state) {
    return null
  }

  const { expression } = refBinding

  const runAssign = (instance) => {
    const mergeScope = {
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
            const __target = ${expression}
            if (Array.isArray(__target)) {
              __target[__refIndex] = __refInstance
            } else {
              ${expression} = __refInstance
            }
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

  return (instance) => {
    if (instance) {
      runAssign(instance)
      return
    }

    // 卸载时清空
    runAssign(null)
  }
}
