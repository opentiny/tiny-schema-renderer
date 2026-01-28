import type { ICustomSettings } from '../types';

const customSettings: ICustomSettings = {};

export const setCustomSettings = (rendererSettings: ICustomSettings): void => {
  if (rendererSettings && typeof rendererSettings === 'object') {
    Object.assign(customSettings, rendererSettings);
  }
};

export const getCustomSettings = (): ICustomSettings => customSettings;

export default function useCustomSetting() {
  return {
    setCustomSettings,
    getCustomSettings,
  };
}
