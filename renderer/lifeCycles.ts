import { parseData } from './render'

export interface JSFunctionDescriptor {
  type: 'JSFunction'
  value: string
}

export interface LifeCycles {
  onMounted?: JSFunctionDescriptor
  onUnmounted?: JSFunctionDescriptor
}

const parseLifeCycleFn = (
  source: JSFunctionDescriptor | undefined,
  getContext: () => any
): (() => void) | null => {
  if (!source || source.type !== 'JSFunction') {
    return null
  }
  const fn = parseData(source, {}, getContext())
  return typeof fn === 'function' ? fn : null
}

export const getPageLifeCycleFns = (
  lifeCycles: LifeCycles | null | undefined,
  getContext: () => any
) => {
  const cycles = lifeCycles ?? {}
  return {
    onMounted: parseLifeCycleFn(cycles.onMounted, getContext),
    onUnmounted: parseLifeCycleFn(cycles.onUnmounted, getContext)
  }
}
