import * as TinyVue from '@opentiny/vue'

export interface IRendererSettings {
  Function?: Function
  materials?: Record<string, any>
}

export const DEFAULT_RENDERER_SETTINGS: IRendererSettings = {
  Function: Function,
  materials: { ...TinyVue }
}

let customSettings: IRendererSettings

export const setCustomSettings = (rendererSettings: IRendererSettings): void => {
  customSettings = rendererSettings
}

export const getCustomSettings = (): IRendererSettings => customSettings

export const getRendererSettingByKey = (key: string): any | undefined =>
  DEFAULT_RENDERER_SETTINGS[key] ?? customSettings?.[key]

export default function useCustomSetting(): {
  setCustomSettings: (rendererSettings: IRendererSettings) => void
  getCustomSettings: () => IRendererSettings
  getRendererSettingByKey: (key: string) => any | undefined
} {
  return {
    setCustomSettings,
    getCustomSettings,
    getRendererSettingByKey
  }
}
