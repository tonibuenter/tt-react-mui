export function toList(data) {
  return !data
    ? []
    : Array.isArray(data)
    ? data
    : !data.table
    ? []
    : data.table.map((row) => {
        var nrow = {}
        row.map((e, index) => (nrow[data.header[index]] = e))
        return nrow
      })
}

export function modulo(number, divisor) {
  return number % divisor
}

export function resolveBoolean(def, propertyName, cx, defaultValue) {
  if (!def || !propertyName) {
    return defaultValue
  }
  const a = def[propertyName]
  if (typeof a === 'boolean') {
    return a
  }
  if (a === 'true') {
    return true
  }
  if (a === 'false') {
    return false
  }
  if (typeof a === 'function') {
    return !!a(cx)
  }
  return defaultValue
}

export function label(arg, value, ttdef) {
  let template
  if (arg === undefined) {
    return '<nolabel>'
  }
  if (typeof arg === 'string') {
    template = arg
  } else {
    if (typeof arg.label === 'function') {
      return arg.label({ value, ttdef })
    }
    template = arg.label || arg.name || '<nolabel>'
  }
  return texting(template, value)
}

export function texting(templateString, parameters) {
  parameters = parameters || {}
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) {
      const r = new RegExp('\\:' + key, 'g')
      templateString = templateString.replace(r, value)
    }
  }
  return templateString
}

export const noop = () => undefined

export function arrayCompare(arr1, arr2) {
  const min = Math.min(arr1.length, arr2.length)
  let m = 'arr equal: '
  for (let i = 0; i < min; i++) {
    m += Object.is(arr1[i], arr2[i])
  }
  console.log(m)
}
