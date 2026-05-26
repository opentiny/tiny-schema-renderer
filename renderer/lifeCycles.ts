import { parseData } from './render'

export interface JSFunctionDescriptor {
  type: 'JSFunction'
  value: string
}

export interface LifeCycles {
  onMounted?: JSFunctionDescriptor
  onUnmounted?: JSFunctionDescriptor
}

const normalizeLifeCycles = (lifeCycles: unknown): LifeCycles => {
  if (lifeCycles == null || typeof lifeCycles !== 'object' || Array.isArray(lifeCycles)) {
    return {}
  }
  return lifeCycles as LifeCycles
}

const parseLifeCycleFn = (
  source: JSFunctionDescriptor | undefined,
  getContext: () => any
): (() => void | Promise<void>) | null => {
  try {
    if (!source || source.type !== 'JSFunction') {
      return null
    }
    const fn = parseData(source, {}, getContext())
    return typeof fn === 'function' ? fn : null
  } catch (error) {
    console.error('RenderMain lifeCycle parse error:', error)
    return null
  }
}

export const getPageLifeCycleFns = (
  lifeCycles: LifeCycles | null | undefined,
  getContext: () => any
) => {
  const cycles = normalizeLifeCycles(lifeCycles)
  return {
    onMounted: parseLifeCycleFn(cycles.onMounted, getContext),
    onUnmounted: parseLifeCycleFn(cycles.onUnmounted, getContext)
  }
}
