import { shallowReactive } from "vue"
import type { UseContextReturn, PageContext, Schema } from '../types/index'

export default (): UseContextReturn => {
  const context = shallowReactive<PageContext>({})
  const oldSchema: { value: Schema | null } = {
    value: null
  }

  // 从大纲树控制隐藏
  const setContext = (ctx: PageContext, clear?: boolean): void => {
    if (clear) {
      Object.keys(context).forEach((key) => delete context[key])
    }
    Object.assign(context, ctx)
  }

  const getContext = (): PageContext => context

  return {
    context,
    oldSchema,
    setContext,
    getContext,
  }
}
