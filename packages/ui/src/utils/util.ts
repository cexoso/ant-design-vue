export const isArray = Array.isArray
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<string, any> => val !== null && typeof val === 'object'
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isNumber = (val: unknown): val is number => typeof val === 'number'
