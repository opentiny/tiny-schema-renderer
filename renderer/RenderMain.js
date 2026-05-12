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

import { h, provide, nextTick, reactive, shallowReactive, watchEffect, inject } from 'vue'
import _ from 'lodash'
import Loading from './Loading.vue'
import renderer, { parseData } from './render'
import useContext from './useContext'
import { setPageCss } from './pageCss'
import { RENDERER_SETTINGS_KEY, APPLY_DEFAULT_PROPS_KEY } from './renderer-settings'
import useCustomSetting from './useCustomSetting'

export default {
  props: {
    schema: {
      type: Object,
      default: () => ({})
    }
  },
  expose: ['setContext', 'getContext', 'setState'],
  setup(props) {
    const { context, oldSchema, setContext, getContext } = useContext()
    const cssScopeId = `data-schema-${Math.random().toString(36).slice(2, 8)}`
    const reset = (obj) => {
      Object.keys(obj).forEach((key) => delete obj[key])
    }

    // 设置 customSettings，如 Function
    const { setCustomSettings } = useCustomSetting()

    const customSettings = inject(RENDERER_SETTINGS_KEY, null)
    if (customSettings) {
      setCustomSettings(customSettings)
    }

    const customContext = inject('customContext', null)
    if (customContext) {
      setContext({ customContext })
    }
    
    const applyDefaultProps = inject(APPLY_DEFAULT_PROPS_KEY, null)
    if (typeof applyDefaultProps === 'function') {
      setCustomSettings({ applyDefaultProps })
    }

    provide('pageContext', context)

    const pageSchema = reactive({})
    const methods = {}
    const state = reactive({})

    const setMethods = (data = {}, clear) => {
      clear && reset(methods)
      // 这里有些方法在画布还是有执行的必要的，比如说表格的renderer和formatText方法，包括一些自定义渲染函数
      Object.assign(
        methods,
        Object.fromEntries(
          Object.keys(data).map((key) => {
            return [key, parseData(data[key], {}, getContext())]
          })
        )
      )
      setContext(methods)
    }

    const setState = (data, clear) => {
      clear && reset(state)
      if (!pageSchema.state) {
        pageSchema.state = data
      }

      Object.assign(state, parseData(data, {}, getContext()) || {})
    }

    const setSchema = async (data) => {
      if (!data || !Object.keys(data).length) {
        return
      }
      const newSchema = JSON.parse(JSON.stringify(data))
      const context = {
        state,
        cssScopeId
      }
      // 此处提升很重要，因为setState、initProps也会触发画布重新渲染，所以需要提升上下文环境的设置时间
      setContext(context, true)

      // 设置方法调用上下文
      setMethods(newSchema.methods, true)

      // 这里setState（会触发画布渲染），是因为状态管理里面的变量会用到props、utils、bridge、stores、methods
      setState(newSchema.state, true)
      await nextTick()
      setPageCss(data.css, cssScopeId)

      Object.assign(pageSchema, newSchema)
    }

    watchEffect(() => {
      // 最后一个判断与上一次的schema做比较，以解决组件循环刷新问题
      if (!props.schema || !Object.keys(props.schema) || _.isEqual(props.schema, oldSchema.value)) {
        return
      }

      // 缓存schema
      oldSchema.value = _.cloneDeep(props.schema)

      setSchema(props.schema)
    })

    return {
      setContext,
      getContext,
      setState,
      pageSchema,
      methods,
      state
    }
  },
  render() {
    // 渲染画布增加根节点，与出码和预览保持一致
    const rootChildrenSchema = {
      componentName: 'div',
      // 手动添加一个唯一的属性，后续在画布选中此节点时方便处理额外的逻辑。由于没有修改schema，不会影响出码
      props: this.pageSchema.props || {},
      children: this.pageSchema.children
    }

    return this.pageSchema.children?.length
      ? h(renderer, { schema: rootChildrenSchema, parent: this.pageSchema })
      : [h(Loading)]
  }
}
