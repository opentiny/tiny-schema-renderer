import type { DefaultPropsMap } from './applyDefaultProps'
import type { Component } from 'vue'

export const RENDERER_SETTINGS = Symbol('RENDERER_SETTINGS')

const defaultMaterials: Record<string, Component> = {}

export interface IRendererSettings {
  Function?: FunctionConstructor
  materials?: Record<string, Component>
  defaultPropsMap?: DefaultPropsMap
}

export const DEFAULT_RENDERER_SETTINGS: IRendererSettings = {
  Function: Function,
  materials: defaultMaterials
}
