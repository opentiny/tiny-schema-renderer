export type PropsValue = any
export type DefaultValue = any

type DefaultValueMap = Record<string, PropsValue>

export type DefaultPropsMap = Record<string, DefaultValueMap>

type Container = Record<string, PropsValue> | PropsValue[]

function isObjectRecord(value: PropsValue): value is Record<string, PropsValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneDefaultValue(value: PropsValue): PropsValue {
  if (!isObjectRecord(value) && !Array.isArray(value)) {
    return value
  }
  return JSON.parse(JSON.stringify(value))
}

function isArrayIndex(key: string): boolean {
  return /^\d+$/.test(key)
}

function isArrayWildcard(key: string): boolean {
  return key === '*'
}

function createContainer(nextKey: string): Container {
  return isArrayIndex(nextKey) || isArrayWildcard(nextKey) ? [] : {}
}

function getChild(container: Container, key: string): PropsValue {
  return Array.isArray(container) ? container[Number(key)] : container[key]
}

function setChild(container: Container, key: string, value: PropsValue): void {
  if (Array.isArray(container)) {
    container[Number(key)] = value
  } else {
    container[key] = value
  }
}

function isTraversable(value: PropsValue, nextKey: string): value is Container {
  if (isArrayIndex(nextKey) || isArrayWildcard(nextKey)) {
    return Array.isArray(value)
  }
  return isObjectRecord(value)
}

function fillAtPath(
  current: Container,
  keys: string[],
  defaultValue: DefaultValue,
): void {
  if (!keys.length) {
    return
  }

  const [key, ...rest] = keys

  if (isArrayWildcard(key)) {
    if (!Array.isArray(current)) {
      return
    }
    for (let i = 0; i < current.length; i++) {
      if (!rest.length) {
        if (current[i] == null) {
          current[i] = cloneDefaultValue(defaultValue)
        }
        continue
      }
      let item = current[i]
      if (item == null) {
        item = createContainer(rest[0])
        current[i] = item
      }
      if (!isTraversable(item, rest[0])) {
        continue
      }
      fillAtPath(item, rest, defaultValue)
    }
    return
  }

  if (!rest.length) {
    if (getChild(current, key) == null) {
      setChild(current, key, cloneDefaultValue(defaultValue))
    }
    return
  }

  const nextKey = rest[0]
  if (isArrayWildcard(nextKey)) {
    const child = getChild(current, key)
    if (!Array.isArray(child)) {
      return
    }
    fillAtPath(child, rest, defaultValue)
    return
  }

  const nextValue = getChild(current, key)
  if (nextValue == null) {
    const created = createContainer(nextKey)
    setChild(current, key, created)
    fillAtPath(created, rest, defaultValue)
    return
  }

  if (!isTraversable(nextValue, nextKey)) {
    return
  }

  fillAtPath(nextValue, rest, defaultValue)
}

function fillMissingValue(
  target: Record<string, PropsValue>,
  propertyPath: string,
  defaultValue: DefaultValue,
): void {
  fillAtPath(target, propertyPath.split('.'), defaultValue)
}

/**
 * 为指定组件的 props 对象补齐缺失的默认属性值。
 *
 * @param componentName - 组件名
 * @param props - 绑定到组件的 props 对象
 * @param defaultPropsMap - 默认值映射表，key 为组件名
 */
export function applyDefaultPropsToProps(
  componentName: string,
  props: Record<string, PropsValue>,
  defaultPropsMap: DefaultPropsMap | null | undefined,
): void {
  if (typeof componentName !== 'string' || !isObjectRecord(defaultPropsMap)) {
    return
  }

  const componentDefaults = defaultPropsMap[componentName]
  if (!componentDefaults) {
    return
  }

  Object.entries(componentDefaults).forEach(([propertyPath, defaultValue]) => {
    fillMissingValue(props, propertyPath, defaultValue)
  })
}
