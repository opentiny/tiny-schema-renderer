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
import type { CustomComponents } from '../types/index'

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
    delete builtinComponents[name as BuiltinComponentsNames]
  })
}

export const getBuiltinComponent = (name: string): Component | undefined => {
  return builtinComponents[name as BuiltinComponentsNames]
}

export type BuiltinComponentsNames = keyof typeof builtinComponents

export const customComponents: CustomComponents = {}

export const registerCustomComponent = (name: string, component: Component): void => {
  customComponents[name] = component
}

export const getCustomComponent = (name: string): Component | undefined => customComponents[name]

export const getComponent = (name: string): Component | string | null => {
  return getBuiltinComponent(name) || getCustomComponent(name) || (isHTMLTag(name) ? name : null)
}
