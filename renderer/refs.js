export const clearRefs = (refsStore = {}) => {
  Object.keys(refsStore).forEach((key) => {
    delete refsStore[key]
  })
}

const removeLoopRef = (refsStore, refName, loopIndex, instance) => {
  const list = refsStore[refName]
  if (!Array.isArray(list)) {
    delete refsStore[refName]
    return
  }

  if (list[loopIndex] === instance) {
    list[loopIndex] = undefined
  }

  if (list.every((item) => item == null)) {
    delete refsStore[refName]
  }
}

/**
 * @param {string} refName
 * @param {Record<string, any>} refsStore
 * @param {number | undefined} loopIndex loop 渲染时的下标
 */
export const createRefSetter = (refName, refsStore, loopIndex) => {
  return (instance) => {
    if (!refName || !refsStore) {
      return
    }

    if (instance) {
      if (loopIndex !== undefined) {
        if (!Array.isArray(refsStore[refName])) {
          refsStore[refName] = []
        }
        refsStore[refName][loopIndex] = instance
      } else {
        refsStore[refName] = instance
      }
      return
    }

    // 组件卸载时移除 ref 实例
    if (loopIndex !== undefined) {
      removeLoopRef(refsStore, refName, loopIndex, instance)
    } else {
      delete refsStore[refName]
    }
  }
}

export const parseRefName = (ref, scope, ctx, parseDataFn) => {
  if (ref == null || ref === '') {
    return
  }

  if (typeof ref === 'string') {
    const name = ref.trim()
    return name
  }

  const parsed = parseDataFn(ref, scope, ctx)
  if (typeof parsed === 'string') {
    const name = parsed.trim()
    return name
  }
}
