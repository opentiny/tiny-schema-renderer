import { shallowReactive } from "vue";

export default () => {
  const context = shallowReactive({});
  const oldSchema = {
    value: null,
  };

  const setContext = (ctx, clear) => {
    if (clear) {
      Object.keys(context).forEach((key) => {
        delete context[key];
      });
    }
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
