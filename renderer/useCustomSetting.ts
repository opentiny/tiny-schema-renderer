import type { Component } from 'vue'
import * as TinyVue from '@opentiny/vue'
import TinyChartPie from '@opentiny/vue-chart-pie'
import TinyChartRadar from '@opentiny/vue-chart-radar'
import TinyChartBar from '@opentiny/vue-chart-bar'
import TinyChartHistogram from '@opentiny/vue-chart-histogram'
import TinyChartLine from '@opentiny/vue-chart-line'
import TinyChartRing from '@opentiny/vue-chart-ring'

export interface IRendererSettings {
  Function?: FunctionConstructor
  materials?: Record<string, Component>
}

const defaultMaterials: Record<string, Component> = {
  ...(TinyVue as unknown as Record<string, Component>),
  TinyChartPie,
  TinyChartRadar,
  TinyChartBar,
  TinyChartHistogram,
  TinyChartLine,
  TinyChartRing
}

export const DEFAULT_RENDERER_SETTINGS: IRendererSettings = {
  Function: Function,
  materials: defaultMaterials
}

let customSettings: IRendererSettings = {}

export const setCustomSettings = (rendererSettings: IRendererSettings): void => {
  customSettings = rendererSettings
}

export const getCustomSettings = (): IRendererSettings => customSettings || {}

export const getRendererSetting = <K extends keyof IRendererSettings>(key: K): IRendererSettings[K] =>
  getCustomSettings()[key] ?? DEFAULT_RENDERER_SETTINGS[key]

export default function useCustomSetting(): {
  setCustomSettings: (rendererSettings: IRendererSettings) => void
  getCustomSettings: () => IRendererSettings
  getRendererSetting: <K extends keyof IRendererSettings>(key: K) => IRendererSettings[K]
} {
  return {
    setCustomSettings,
    getCustomSettings,
    getRendererSetting
  }
}
