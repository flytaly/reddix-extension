// https://gist.github.com/select/0e2aa49b98ea81db7c615e6560497c41

function getKeys(obj: any, prefix = ''): string[] {
  if (typeof obj === 'undefined' || obj === null) return []
  return [
    ...Object.keys(obj).map((key) => `${prefix}${key}`),
    ...Object.entries(obj).reduce((acc, [key, value]) => {
      if (typeof value === 'object') return [...acc, ...getKeys(value, `${prefix}${key}.`)]
      return acc
    }, [] as string[]),
  ]
}
function flatObject(obj: any, prefix = ''): Record<string, unknown> {
  if (typeof obj === 'undefined' || obj === null) return {}
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'object') return { ...acc, ...flatObject(value, `${prefix}${key}.`) }
    return { ...acc, [`${prefix}${key}`]: value }
  }, {})
}

function escapeCsvValue(cell: string) {
  if (cell.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + cell.replace(/"/g, '""') + '"'
  }
  return cell
}

export function objectsToCsv(arrayOfObjects: Array<any>) {
  // collect all available keys
  const keys = new Set<string>(arrayOfObjects.reduce((acc, item) => [...acc, ...getKeys(item)], []))
  // for each object create all keys
  const values = arrayOfObjects.map((item) => {
    const fo = flatObject(item)
    const val = Array.from(keys).map((key: string): any => (key in fo ? escapeCsvValue(`${fo[key]}`) : ''))
    return val.join(',')
  })
  return `${Array.from(keys).join(',')}\n${values.join('\n')}`
}
