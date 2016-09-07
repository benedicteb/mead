/* eslint-disable id-length */
const Color = require('color')

const queryMap = {
  w: ['width', num],
  h: ['height', num],
  q: ['quality', numBetween(0, 100)],
  bg: ['backgroundColor', color],
  fm: ['output', mime(enumz(['jpg', 'pjpg', 'png', 'webp']))],
  rot: ['rotation', num, enumz([0, 90, 180, 270])],
  flip: ['flip', enumz(['h', 'v', 'hv'])],
  dl: ['download', identity],
  fit: ['fit', enumz(['clip', 'crop', 'fill', 'fillmax', 'max', 'scale'])] // 'clamp', 'min', 'facearea'
}

function validateTransforms(qs) {
  return Object.keys(qs).reduce((params, param) => {
    // Skip unrecognized parameters
    if (!queryMap[param]) {
      return params
    }

    const [name, ...validators] = queryMap[param]
    const value = validators.reduce(
      (result, validator) => validator(param, result),
      qs[param]
    )

    params[name] = value
    return params
  }, {})
}

function identity(param, input) {
  return input
}

function num(param, value) {
  const val = Number(value)
  if (isNaN(val)) {
    throw new Error(`Parameter "${param}" must be a valid number`)
  }

  return val
}

function numBetween(min, max) {
  return (param, value) => {
    const val = num(param, value)
    if (val < min || val > max) {
      throw new Error(`Parameter "${param}" must be between ${min} and ${max}`)
    }

    return val
  }
}

function enumz(values) {
  return (param, value) => {
    if (!values.includes(value)) {
      throw new Error(`Parameter "${param}" must be one of: [${values.map(quote).join(', ')}]`)
    }

    return value
  }
}

function color(param, value) {
  const val = value.toLowerCase()
  if (!/^[a-f0-9]+$/.test(val)) {
    throw new Error(`Parameter "${param}" must be a valid hexadecimal color`)
  }

  const formats = ['rgb', 'argb', 'rrggbb', 'aarrggbb']
  const allowed = [3, 4, 6, 8]
  if (!allowed.includes(val.length)) {
    throw new Error(
      `Parameter "${param}" must be a valid hexadecimal color.\n`
      + `Allowed formats: ${formats.join(', ')}`
    )
  }

  if (val.length !== 4 && val.length !== 8) {
    return `#${val}`
  }

  // The color module that sharp uses doesn't recognize argb syntax,
  // so we have to help it translate
  const al = val.length === 4 ? 1 : 2
  const alp = val.substr(0, al)
  const base = val.substr(al)
  const alpha = alp.length === 1 ? alp[0] + alp[0] : alp
  return Color(`#${base}`).alpha(parseInt(alpha, 16) / 255).rgb()
}

function quote(str) {
  return `"${str}"`
}

function mime(formatter) {
  const formatMap = {
    jpg: 'jpeg',
    pjpg: 'jpeg'
  }

  return (...args) => {
    const format = formatter(...args)
    const progressive = format === 'pjpg'
    const normal = formatMap[format] || format

    return {
      format: normal,
      mime: `image/${normal}`,
      progressive
    }
  }
}

module.exports = validateTransforms
