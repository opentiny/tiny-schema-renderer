import { shallowReactive } from "vue";

export const MATERIALS = Symbol('MATERIALS');
export const NOTIFY = Symbol('NOTIFY');

export default () => {
  const context = shallowReactive({});
  const oldSchema = {
    value:null
  }

  // 从大纲树控制隐藏

  const setContext = (ctx, clear) => {
    clear && Object.keys(context).forEach((key) => delete context[key]);
    Object.assign(context, ctx);
  };

  const getContext = () => context;

  return {
    context,
    oldSchema,
    setContext,
    getContext,
  };
};
