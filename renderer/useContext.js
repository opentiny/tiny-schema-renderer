import { reactive, watch } from 'vue';

export default () => {
  const context = reactive({});

  const setContext = (ctx, clear) => {
    clear && Object.keys(context).forEach(key => delete context[key]);
    Object.assign(context, ctx);
  };

  const getContext = () => context;

  return {
    context,
    setContext,
    getContext,
  };
};
