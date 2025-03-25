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

import { h, ref, provide, watch, nextTick, reactive, shallowReactive, watchEffect } from 'vue';
import Loading from './Loading.vue';
import renderer, { parseData } from './render';
import useContext from './useContext';
import useState from './useState';

export default {
  props: {
    schema: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { context, setContext, getContext } = useContext();
    const { state, setState } = useState({ getContext });
    const reset = obj => {
      Object.keys(obj).forEach(key => delete obj[key]);
    };

    provide('pageContext', context);

    const refreshKey = ref(1);
    const pageSchema = reactive({});
    const methods = {};

    const setMethods = (data = {}, clear) => {
      clear && reset(methods);
      // 这里有些方法在画布还是有执行的必要的，比如说表格的renderer和formatText方法，包括一些自定义渲染函数
      Object.assign(
        methods,
        Object.fromEntries(
          Object.keys(data).map(key => {
            return [key, parseData(data[key], {}, getContext())];
          })
        )
      );
      setContext(methods);
    };

    const setPageCss = (css = '') => {
      const id = 'page-css';
      let element = document.getElementById(id);
      const head = document.querySelector('head');

      document.body.setAttribute('style', '');

      if (!element) {
        element = document.createElement('style');
        element.setAttribute('type', 'text/css');
        element.setAttribute('id', id);

        element.innerHTML = css;
        head.appendChild(element);
      } else {
        element.innerHTML = css;
      }
    };

    const setSchema = async data => {
      if (!data) {
        return;
      }
      const newSchema = JSON.parse(JSON.stringify(data));
      const context = {
        state,
      };

      setContext(context);
      setMethods(newSchema.methods);
      setState(newSchema.state);
      await nextTick();
      setPageCss(data.css);

      Object.assign(pageSchema, newSchema);
    };

    watchEffect(() => {
      if (!props.schema || !Object.keys(props.schema).length) {
        return;
      }

      setSchema(props.schema);
    });

    return {
      pageSchema,
      methods,
      refreshKey,
    };
  },
  render() {
    const { refreshKey } = this;
    // 渲染画布增加根节点，与出码和预览保持一致
    const rootChildrenSchema = {
      componentName: 'div',
      // 手动添加一个唯一的属性，后续在画布选中此节点时方便处理额外的逻辑。由于没有修改schema，不会影响出码
      props: {},
      children: this.pageSchema.children,
    };

    return this.pageSchema.children?.length
      ? h(renderer, { key: refreshKey.value, schema: rootChildrenSchema, parent: this.pageSchema })
      : [h(Loading)];
  },
};
