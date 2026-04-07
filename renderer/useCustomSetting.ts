import * as TinyVue from '@opentiny/vue'
import TinyChartPie from '@opentiny/vue-chart-pie'
import TinyChartRadar from '@opentiny/vue-chart-radar'
import TinyChartBar from '@opentiny/vue-chart-bar'
import TinyChartHistogram from '@opentiny/vue-chart-histogram'
import TinyChartLine from '@opentiny/vue-chart-line'
import TinyChartRing from '@opentiny/vue-chart-ring'

export interface IRendererSettings {
  Function?: Function
  materials?: Record<string, any>
}

export const DEFAULT_RENDERER_SETTINGS: IRendererSettings = {
  Function: Function,
  materials: {
    ...TinyVue,
    ...TinyChartPie,
    ...TinyChartRadar,
    ...TinyChartBar,
    ...TinyChartHistogram,
    ...TinyChartLine,
    ...TinyChartRing
  }
}

let customSettings: IRendererSettings

export const setCustomSettings = (rendererSettings: IRendererSettings): void => {
  customSettings = rendererSettings
}

export const getCustomSettings = (): IRendererSettings => customSettings || {}

export const getRendererSetting = (key: keyof IRendererSettings): any | undefined =>
  getCustomSettings()[key] ?? DEFAULT_RENDERER_SETTINGS[key]

export default function useCustomSetting(): {
  setCustomSettings: (rendererSettings: IRendererSettings) => void
  getCustomSettings: () => IRendererSettings
  getRendererSetting: (key: keyof IRendererSettings) => any | undefined
} {
  return {
    setCustomSettings,
    getCustomSettings,
    getRendererSetting
  }
}
