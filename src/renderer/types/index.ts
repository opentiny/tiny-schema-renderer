import type { Component, ComponentPublicInstance } from 'vue';
import type { BuiltinComponentsName } from '../core/materials-functions';

// Schema 相关类型定义
export interface ISchemaProps {
  [key: string]: any;
}

export interface ILoopArgs {
  item?: string;
  index?: string;
}

export interface ISchemaChild {
  componentName: string;
  props?: ISchemaProps;
  loop?: any;
  loopArgs?: ILoopArgs;
  condition?: any;
  children?: ISchemaChild[];
  [key: string]: any;
}

export interface ISchema {
  componentName?: string;
  props?: ISchemaProps;
  children?: ISchemaChild[];
  state?: Record<string, any>;
  methods?: Record<string, any>;
  css?: string;
  [key: string]: any;
}

// 渲染器选项类型
export interface ISchemaRendererOptions {
  builtInExcludes?: BuiltinComponentsName[];
  loading?: boolean;
  loadingComponent?: Component;
  componentResolver?: (name: string) => Component | null;
}

// 上下文类型
export interface IPageContext {
  state?: Record<string, any>;
  [key: string]: any;
}

// 组件注册相关类型
export interface ICustomComponent {
  name: string;
  component: Component;
}

// 渲染器函数类型
export type RendererFunction = (schema: ISchemaChild, parent?: ISchema) => ComponentPublicInstance | null;

// 解析数据函数类型
export type ParseDataFunction = (data: any, context?: Record<string, any>, parentContext?: IPageContext) => any;

// 内置组件类型
export interface IBuiltinComponents {
  [key: string]: Component;
}

// 自定义组件类型
export interface ICustomComponents {
  [key: string]: Component;
}

// 上下文钩子返回类型
export interface IUseContextReturn {
  context: IPageContext;
  oldSchema: { value: ISchema | null };
  setContext: (ctx: IPageContext, clear?: boolean) => void;
  getContext: () => IPageContext;
}

// 创建渲染器返回类型
export type CreateSchemaRendererReturn = (props: { schema: ISchema }) => ComponentPublicInstance;

// 组件属性类型
export interface IComponentProps {
  schema: ISchema;
  parent?: ISchema;
  [key: string]: any;
}

export interface ICustomSettings {
  Function?: Function;
}
