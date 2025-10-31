import selectorParser from 'postcss-selector-parser'

const animationNameRE = /^(-\w+-)?animation-name$/
const animationRE = /^(-\w+-)?animation$/

const scopedPlugin = (id = '') => {
  const keyframes = Object.create(null)
  const shortId = id.replace(/^data-v-/, '')

  return {
    postcssPlugin: 'vue-sfc-scoped',
    Rule(rule) {
      processRule(id, rule)
    },
    AtRule(node) {
      if (/-?keyframes$/.test(node.name) && !node.params.endsWith(`-${shortId}`)) {
        keyframes[node.params] = node.params = node.params + '-' + shortId
      }
    },
    OnceExit(root) {
      if (Object.keys(keyframes).length) {
        root.walkDecls((decl) => {
          if (animationNameRE.test(decl.prop)) {
            decl.value = decl.value
              .split(',')
              .map((v) => keyframes[v.trim()] || v.trim())
              .join(',')
          }
          if (animationRE.test(decl.prop)) {
            decl.value = decl.value
              .split(',')
              .map((v) => {
                const vals = v.trim().split(/\s+/)
                const i = vals.findIndex((val) => keyframes[val])
                if (i !== -1) {
                  vals.splice(i, 1, keyframes[vals[i]])
                  return vals.join(' ')
                } else {
                  return v
                }
              })
              .join(',')
          }
        })
      }
    }
  }
}

const processedRules = new WeakSet()

function processRule(id, rule) {
  if (
    processedRules.has(rule) ||
    (rule.parent && rule.parent.type === 'atrule' && /-?keyframes$/.test(rule.parent.name))
  ) {
    return
  }
  processedRules.add(rule)
  rule.selector = selectorParser((selectorRoot) => {
    selectorRoot.each((selector) => {
      rewriteSelector(id, selector, selectorRoot)
    })
  }).processSync(rule.selector)
}

function rewriteSelector(id, selector, selectorRoot) {
  let node = null
  let shouldInject = true
  selector.each((n) => {
    if (n.type === 'combinator' && (n.value === '>>>' || n.value === '/deep/')) {
      n.value = ' '
      n.spaces.before = n.spaces.after = ''

      return false
    }

    if (n.type === 'pseudo') {
      const { value } = n
      if (value === ':deep' || value === '::v-deep') {
        if (n.nodes.length) {
          let last = n
          n.nodes[0].each((ss) => {
            selector.insertAfter(last, ss)
            last = ss
          })
          const prev = selector.at(selector.index(n) - 1)
          if (!prev || !isSpaceCombinator(prev)) {
            selector.insertAfter(
              n,
              selectorParser.combinator({
                value: ' '
              })
            )
          }
          selector.removeChild(n)
        } else {

          const prev = selector.at(selector.index(n) - 1)
          if (prev && isSpaceCombinator(prev)) {
            selector.removeChild(prev)
          }
          selector.removeChild(n)
        }
        return false
      }

      if (value === ':global' || value === '::v-global') {
        selectorRoot.insertAfter(selector, n.nodes[0])
        selectorRoot.removeChild(selector)
        return false
      }
    }

    if (n.type !== 'pseudo' && n.type !== 'combinator') {
      node = n
    }
  })

  if (node) {
    node.spaces.after = ''
  } else {
    selector.first.spaces.before = ''
  }

  if (shouldInject) {
    selector.insertAfter(
      node,
      selectorParser.attribute({
        attribute: id,
        value: id,
        raws: {},
        quoteMark: `"`
      })
    )
  }
}

function isSpaceCombinator(node) {
  return node.type === 'combinator' && /^\s+$/.test(node.value)
}

scopedPlugin.postcss = true
export default scopedPlugin
