const customSettings = {}


export const setCustomSettings = (rendererSettings) => {
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

