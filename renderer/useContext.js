import { shallowReactive, watch } from "vue";

export default () => {
  const context = shallowReactive({});

  // 从大纲树控制隐藏

  const setContext = (ctx, clear) => {
    clear && Object.keys(context).forEach((key) => delete context[key]);
    Object.assign(context, ctx);
  };

  const getContext = () => context;

  watch(
    () => context.state,
    (val) => {
      debugger
    },
    {
      deep: true,
      immediate: true,
      onTrigger(...args) {
        debugger;
      },
    }
  );

  return {
    context,
    setContext,
    getContext,
  };
};
