import { Component, ComponentPublicInstance } from 'vue'
import type { BuiltinComponentsName } from '../core/materials-functions'

// Schema 相关类型定义
export interface SchemaProps {
  [key: string]: any
}

export interface LoopArgs {
  item?: string
  index?: string
}

export interface SchemaChild {
  componentName: string
  props?: SchemaProps
  loop?: any
  loopArgs?: LoopArgs
  condition?: any
  children?: SchemaChild[]
  [key: string]: any
}

export interface Schema {
  componentName?: string
  props?: SchemaProps
  children?: SchemaChild[]
  state?: Record<string, any>
  methods?: Record<string, any>
  css?: string
  [key: string]: any
}

// 渲染器选项类型
export interface SchemaRendererOptions {
  builtInExcludes?: BuiltinComponentsName[]
  components?: Record<string, Component | Record<string, any>>
  loading?: boolean
  loadingComponent?: Component
  [key: string]: any
}

// 上下文类型
export interface PageContext {
  state?: Record<string, any>
  [key: string]: any
}

// 组件注册相关类型
export interface CustomComponent {
  name: string
  component: Component
}

// 渲染器函数类型
export interface RendererFunction {
  (schema: SchemaChild, parent?: Schema): ComponentPublicInstance | null
}

// 解析数据函数类型
export interface ParseDataFunction {
  (data: any, context?: Record<string, any>, parentContext?: PageContext): any
}

// 内置组件类型
export interface BuiltinComponents {
  [key: string]: Component
}

// 自定义组件类型
export interface CustomComponents {
  [key: string]: Component
}

// 上下文钩子返回类型
export interface UseContextReturn {
  context: PageContext
  oldSchema: { value: Schema | null }
  setContext: (ctx: PageContext, clear?: boolean) => void
  getContext: () => PageContext
}

// 创建渲染器返回类型
export interface CreateSchemaRendererReturn {
  (props: { schema: Schema }): ComponentPublicInstance
}

// 组件属性类型
export interface ComponentProps {
  schema: Schema
  parent?: Schema
  [key: string]: any
}
