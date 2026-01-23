import { isHTMLTag } from '@vue/shared'
import type { Component } from 'vue'
import {
  CanvasRow,
  CanvasCol,
  CanvasRowColContainer,
  CanvasFlexBox,
  CanvasSection
} from '@opentiny/tiny-engine-builtin-component'
import {
  CanvasBox,
  CanvasIcon,
  CanvasText,
  CanvasSlot,
  CanvasImg,
  CanvasPlaceholder,
  CanvasRouterLink,
  CanvasRouterView
} from '../builtin'
import type { ICustomComponents } from '../types/index'

export const builtinComponents = {
  Icon: CanvasIcon,
  Text: CanvasText,
  div: CanvasBox,
  Slot: CanvasSlot,
  slot: CanvasSlot,
  Template: CanvasBox,
  Img: CanvasImg,
  CanvasRow,
  CanvasCol,
  CanvasRowColContainer,
  CanvasFlexBox,
  CanvasSection,
  CanvasPlaceholder,
  CanvasRouterLink,
  CanvasRouterView
}

export const excludeBuiltinComponents = (names: string[]) => {
  names.forEach((name) => {
    delete builtinComponents[name as BuiltinComponentsName]
  })
}

export const getBuiltinComponent = (name: string): Component | undefined => {
  return builtinComponents[name as BuiltinComponentsName]
}

export type BuiltinComponentsName = keyof typeof builtinComponents

export const customComponents: ICustomComponents = {}

export const registerCustomComponent = (name: string, component: Component): void => {
  customComponents[name] = component
}

export const getCustomComponent = (name: string): Component | undefined => customComponents[name]

let customComponentResolver: ((name: string) => Component | null) | null = null

export const setComponentResolver = (resolver: ((name: string) => Component | null) | null): void => {
  customComponentResolver = resolver
}

export const getComponent = (name: string): Component | string | null => {
  // 优先级：内置组件 > 自定义组件 > 组件解析器 > HTML标签
  return (
    getBuiltinComponent(name) ||
    getCustomComponent(name) ||
    (customComponentResolver ? customComponentResolver(name) : null) ||
    (isHTMLTag(name) ? name : null)
  )
}
