import type { Component } from 'vue'
import type { DefaultPropsMap } from './applyDefaultProps'

export interface IRendererSettings {
  Function?: FunctionConstructor
  materials?: Record<string, Component>
  defaultPropsMap?: DefaultPropsMap
}

const defaultMaterials: Record<string, Component> = {}

export const DEFAULT_RENDERER_SETTINGS: IRendererSettings = {
  Function: Function,
  materials: defaultMaterials
}

let customSettings: IRendererSettings = {}

export const setCustomSettings = (rendererSettings: IRendererSettings): void => {
  customSettings = rendererSettings
}

export const getCustomSettings = (): IRendererSettings => customSettings || {}

export default function useCustomSetting(): {
  setCustomSettings: (rendererSettings: IRendererSettings) => void
  getCustomSettings: () => IRendererSettings
} {
  return {
    setCustomSettings,
    getCustomSettings
  }
}
