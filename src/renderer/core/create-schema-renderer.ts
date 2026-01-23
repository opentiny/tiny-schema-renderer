import { h, provide, nextTick, reactive, watchEffect, defineComponent, inject } from 'vue'
import type { Component } from 'vue'
import useContext from './use-context'
import { createRenderer } from './renderer'
import Loading from './Loading.vue'
import _ from 'lodash'
import { parseData } from './data-parser'
import type { Schema, SchemaRendererOptions } from '../types/index'
import { setPageCss } from './page-css'
import useCustomSetting from './useCustomSetting'
import { RENDERER_SETTINGS_KEY } from './renderer-settings'

export const createSchemaRenderer = (options: SchemaRendererOptions = {}): Component => {
  return defineComponent({
    name: 'SchemaRenderer',
    props: {
      schema: {
        type: Object as () => Schema,
        default: () => ({})
      }
    },
    setup(props) {
      const { context, oldSchema, setContext, getContext } = useContext()
      const cssScopeId = `data-schema-${Math.random().toString(36).slice(2, 8)}`
      const reset = (obj: Record<string, any>): void => {
        Object.keys(obj).forEach((key) => delete obj[key])
      }

      // 设置 customSettings，如 Function
      const { setCustomSettings } = useCustomSetting()

      const customSettings = inject(RENDERER_SETTINGS_KEY, null)
      if (customSettings) {
        setCustomSettings(customSettings)
      }

      const customContext = inject('customContext')
      if (customContext) {
        setContext({ customContext })
      }

      provide('pageContext', context)

      const pageSchema = reactive<Schema>({})
      const methods: Record<string, any> = {}
      const state = reactive<Record<string, any>>({})

      const setMethods = (data: Record<string, any> = {}, clear?: boolean): void => {
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

      const setState = (data: Record<string, any>, clear?: boolean): void => {
        clear && reset(state)
        if (!pageSchema.state) {
          pageSchema.state = data
        }

        Object.assign(state, parseData(data, {}, getContext()) || {})
      }

      const setSchema = async (data: Schema): Promise<void> => {
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
        setPageCss(data.css || '', cssScopeId)

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
        props: {},
        children: this.pageSchema.children
      }

      const { loading = true, loadingComponent = Loading, ...rest } = options
      const renderer = createRenderer(rest)

      return this.pageSchema.children?.length
        ? h(renderer as any, { schema: rootChildrenSchema, parent: this.pageSchema })
        : loading
          ? [h(loadingComponent as any)]
          : []
    }
  })
}
