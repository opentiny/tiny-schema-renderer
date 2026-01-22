import { h, provide, inject, defineComponent, type VNode } from 'vue'
import {
  getComponent,
  registerCustomComponent,
  excludeBuiltinComponents,
  builtinComponents
} from './materials-functions'
import { parseData } from './data-parser'
import type { Schema, SchemaChild, PageContext, SchemaRendererOptions } from '../types/index'

interface LoopArgs {
  item?: string
  index?: string
}

interface LoopScopeParams {
  scope: Record<string, any>
  index: number
  item: any
  loopArgs?: LoopArgs
}

interface ConfigureData {
  [key: string]: any
}

const getBindProps = (schema: SchemaChild, scope: Record<string, any>, context: PageContext) => {
  const { componentName } = schema

  if (componentName === 'CanvasPlaceholder') {
    return {}
  }

  const bindProps = {
    ...parseData(schema.props, scope, context),
    'data-id': schema.id,
    'data-tag': componentName
  }

  if (componentName in builtinComponents) {
    bindProps.schema = schema
  }

  // 绑定组件属性时需要将 className 重命名为 class，防止覆盖组件内置 class
  bindProps.class = bindProps.className
  delete bindProps.className

  return
}

function renderComponent(schema: SchemaChild, scope: Record<string, any> = {}, context: PageContext): VNode | null {
  const { componentName, loop, loopArgs, condition } = schema

  if (!componentName) {
    return null
  }

  const component = getComponent(componentName)

  if (!component) {
    return null
  }

  const loopList = parseData(loop, scope, context)

  const renderElement = (item: any, index: number): VNode | null => {
    let mergeScope = item
      ? getLoopScope({
          item,
          index,
          loopArgs,
          scope
        })
      : scope

    if (!parseCondition(condition, mergeScope, context)) {
      return null
    }

    // const props = parseData(schema.props, mergeScope, context) || {}
    const props = getBindProps(schema, mergeScope, context)
    const children = getChildren(schema, mergeScope, context)

    return h(component, props, children)
  }

  if (loopList && Array.isArray(loopList)) {
    return h('div', {}, loopList.map(renderElement).filter(Boolean))
  }

  return renderElement(null, 0)
}

const parseCondition = (condition: any, scope: Record<string, any>, context: PageContext): boolean => {
  if (!condition) {
    return true
  }
  return parseData(condition, scope, context)
}

const parseLoopArgs = ({
  item,
  index,
  loopArgs
}: {
  item: any
  index: number
  loopArgs?: LoopArgs
}): Record<string, any> => {
  if (!loopArgs) {
    return { item, index }
  }
  return {
    [loopArgs.item || 'item']: item,
    [loopArgs.index || 'index']: index
  }
}

const getLoopScope = ({ scope, index, item, loopArgs }: LoopScopeParams): Record<string, any> => {
  return {
    ...scope,
    ...(parseLoopArgs({
      item,
      index,
      loopArgs
    }) || {})
  }
}

const injectPlaceHolder = (componentName: string, children: SchemaChild[] | undefined): SchemaChild[] => {
  const isEmptyArr = Array.isArray(children) && !children.length

  if (configure[componentName]?.isContainer && (!children || isEmptyArr)) {
    return [
      {
        componentName: 'CanvasPlaceholder'
      }
    ]
  }

  return children || []
}

const directChildrenHasTemplate = (children: SchemaChild[]): boolean => {
  return children.some((child) => child.componentName === 'Template')
}

const renderSlot = (children: SchemaChild[], mergeScope: Record<string, any>, _schema: SchemaChild): any => {
  // 实现渲染插槽的逻辑
  return children.map((child) => renderComponent(child, mergeScope, {} as PageContext)).filter(Boolean)
}

const getChildren = (schema: SchemaChild, mergeScope: Record<string, any>, context: PageContext): any => {
  const { componentName, children } = schema
  const renderChildren = injectPlaceHolder(componentName, children)

  if (!Array.isArray(renderChildren)) {
    return parseData(renderChildren, mergeScope, context)
  }

  if (!renderChildren.length) {
    return null
  }

  if (directChildrenHasTemplate(renderChildren)) {
    return renderSlot(renderChildren, mergeScope, schema)
  }

  // 这里 children 需要返回一个默认插槽的函数，避免 vue 告警：
  // Non-function value encountered for default slot. Prefer function slots for better performance.
  return {
    default: () => children?.map?.((child) => renderComponent(child, mergeScope, context)).filter(Boolean) || []
  }
}

export const collectionMethodsMap: Record<string, any> = {}

const configure: ConfigureData = {}

export const setConfigure = (configureData: ConfigureData): void => {
  Object.assign(configure, configureData)
}

export const renderer = defineComponent({
  name: 'renderer',
  props: {
    schema: {
      type: Object as () => SchemaChild,
      required: true
    },
    scope: {
      type: Object as () => Record<string, any>,
      default: () => ({})
    },
    parent: {
      type: Object as () => Schema,
      default: () => ({})
    }
  },
  setup(props) {
    provide('schema', props.schema)
  },
  render() {
    const context = inject('pageContext') as PageContext
    const { scope, schema } = this

    return renderComponent(schema, scope, context)
  }
})

export const createRenderer = (options: SchemaRendererOptions = {}) => {
  const { builtInExcludes = [], components = {}, hooks = {} } = options

  excludeBuiltinComponents(builtInExcludes)

  Object.entries(components).forEach(([name, component]) => {
    if (component && (typeof component === 'object' || typeof component === 'function')) {
      registerCustomComponent(name, component)
    }
  })

  return renderer
}

export default renderer
