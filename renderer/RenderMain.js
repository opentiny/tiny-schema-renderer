/**
 * Copyright (c) 2023 - present TinyEngine Authors.
 * Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */

import { h, provide, nextTick, reactive, shallowReactive, watchEffect } from "vue";
import Loading from "./Loading.vue";
import renderer, { parseData } from "./render";
import useContext from "./useContext";

export default {
  props: {
    schema: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { context, setContext, getContext } = useContext();
    const reset = (obj) => {
      Object.keys(obj).forEach((key) => delete obj[key]);
    };

    provide("pageContext", context);

    const pageSchema = reactive({});
    const methods = {};
    const state = reactive({});

    const setMethods = (data = {}, clear) => {
      clear && reset(methods);
      // 这里有些方法在画布还是有执行的必要的，比如说表格的renderer和formatText方法，包括一些自定义渲染函数
      Object.assign(
        methods,
        Object.fromEntries(
          Object.keys(data).map((key) => {
            return [key, parseData(data[key], {}, getContext())];
          })
        )
      );
      setContext(methods);
    };

    const setState = (data, clear) => {
      clear && reset(state);
      if (!pageSchema.state) {
        pageSchema.state = data;
      }

      Object.assign(state, parseData(data, {}, getContext()) || {});
    };

    const setPageCss = (css = "") => {
      const id = "page-css";
      let element = document.getElementById(id);
      const head = document.querySelector("head");

      document.body.setAttribute("style", "");

      if (!element) {
        element = document.createElement("style");
        element.setAttribute("type", "text/css");
        element.setAttribute("id", id);

        element.innerHTML = css;
        head.appendChild(element);
      } else {
        element.innerHTML = css;
      }
    };

    const setSchema = async (data) => {
      if (!data) {
        return;
      }
      const newSchema = JSON.parse(JSON.stringify(data));

      const context = {
        state,
      };
      // 此处提升很重要，因为setState、initProps也会触发画布重新渲染，所以需要提升上下文环境的设置时间
      setContext(context, true);

      // 设置方法调用上下文
      setMethods(newSchema.methods, true);

      // 这里setState（会触发画布渲染），是因为状态管理里面的变量会用到props、utils、bridge、stores、methods
      setState(newSchema.state, true);
      await nextTick();
      setPageCss(data.css);

      Object.assign(pageSchema, newSchema);
    };

    watchEffect(() => {
      if (!props.schema || !Object.keys(props.schema)) {
        return;
      }

      setSchema(props.schema);
    });

    return {
      pageSchema,
      methods,
      state,
    };
  },
  render() {
    // 渲染画布增加根节点，与出码和预览保持一致
    const rootChildrenSchema = {
      componentName: "div",
      // 手动添加一个唯一的属性，后续在画布选中此节点时方便处理额外的逻辑。由于没有修改schema，不会影响出码
      props: {},
      children: this.pageSchema.children,
    };

    return this.pageSchema.children?.length
      ? h(renderer, { schema: rootChildrenSchema, parent: this.pageSchema })
      : [h(Loading)];
  },
};
