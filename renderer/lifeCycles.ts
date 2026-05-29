import { parseData } from './render'

export interface JSFunctionDescriptor {
  type: 'JSFunction'
  value: string
}

export interface LifeCycles {
  onMounted?: unknown
  onUnmounted?: unknown
}

const normalizeLifeCycles = (lifeCycles: unknown): LifeCycles => {
  if (lifeCycles == null || typeof lifeCycles !== 'object' || Array.isArray(lifeCycles)) {
    return {}
  }
  return lifeCycles as LifeCycles
}

const parseLifeCycleFn = (source: unknown, getContext: () => any): (() => void | Promise<void>) | null => {
  if (source == null) {
    return null
  }
  try {
    const parsed = parseData(source, {}, getContext())
    return typeof parsed === 'function' ? parsed : null
  } catch (error) {
    console.error('LifeCycle parse error:', error)
    return null
  }
}

export const getPageLifeCycleFns = (lifeCycles: LifeCycles | null | undefined, getContext: () => any) => {
  const cycles = normalizeLifeCycles(lifeCycles)
  return {
    onMounted: parseLifeCycleFn(cycles.onMounted, getContext),
    onUnmounted: parseLifeCycleFn(cycles.onUnmounted, getContext)
  }
}
