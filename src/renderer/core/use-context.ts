import { shallowReactive } from "vue"
import type { IUseContextReturn, IPageContext, ISchema } from '../types/index'

export default (): IUseContextReturn => {
  const context = shallowReactive<IPageContext>({})
  const oldSchema: { value: ISchema | null } = {
    value: null
  }

  // 从大纲树控制隐藏
  const setContext = (ctx: IPageContext, clear?: boolean): void => {
    if (clear) {
      Object.keys(context).forEach((key) => delete context[key])
    }
    Object.assign(context, ctx)
  }

  const getContext = (): IPageContext => context

  return {
    context,
    oldSchema,
    setContext,
    getContext,
  }
}
