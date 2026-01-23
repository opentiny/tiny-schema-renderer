import type { ICustomSettings } from '../types'

const customSettings: ICustomSettings = {}

export const setCustomSettings = (rendererSettings: ICustomSettings): void => {
  if (rendererSettings && typeof rendererSettings === 'object') {
    Object.assign(customSettings, rendererSettings)
  }
}

export const getCustomSettings = () => customSettings

export default function useCustomSetting() {
  return {
    setCustomSettings,
    getCustomSettings
  }
}

