import { parseData } from './render'

export interface LifeCycles {
  onMounted: {
    type: 'JSFunction'
    value: string
  }
  onUnmounted: {
    type: 'JSFunction'
    value: string
  }
}

const parseLifeCycleFn = (source: { type: 'JSFunction'; value: string }, getContext: () => any): Function => {
  if (!source || source.type !== 'JSFunction') {
    return () => {}
  }
  const fn = parseData(source, {}, getContext())
  return typeof fn === 'function' ? fn : () => {}
}

export const getPageLifeCycleFns = (lifeCycles: LifeCycles, getContext: () => any) => {
  return {
    onMounted: parseLifeCycleFn(lifeCycles.onMounted, getContext),
    onUnmounted: parseLifeCycleFn(lifeCycles.onUnmounted, getContext)
  }
}
