import { shallowReactive } from "vue";
import { clearRefs } from "./refs";

export default () => {
  const context = shallowReactive({
    $refs: {},
    refs: null,
  });
  context.refs = context.$refs;
  const oldSchema = {
    value:null
  }

  // 从大纲树控制隐藏

  const setContext = (ctx, clear) => {
    if (clear) {
      Object.keys(context).forEach((key) => {
        if (key === "$refs" || key === "refs") {
          clearRefs(context.$refs);
        } else {
          delete context[key];
        }
      });
    }
    Object.assign(context, ctx);
    context.refs = context.$refs;
  };

  const getContext = () => context;

  return {
    context,
    oldSchema,
    setContext,
    getContext,
  };
};
