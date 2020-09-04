const ValidationError = require('../errors/validationError')
const getMinimumInputSize = require('../transform/minimumInputSize')

const pipeline = [
  validateSourceRectCoords,
  fractionParamsToPixels,
  mapOutputFormat,
  minimumInputSize,
]

module.exports = (params, meta, config) => {
  pipeline.forEach(operation => operation(params, meta, config))
  return params
}

function minimumInputSize(params, meta) {
  params.minimumInputSize = getMinimumInputSize(params, meta)
}

function validateSourceRectCoords(params, meta) {
  const rect = params.sourceRectangle
  if (!rect) {
    return
  }

  let imageWidth = meta.width
  let imageHeight = meta.height
  if (typeof params.orientation === 'undefined' && (meta.orientation === 8 || meta.orientation === 6)) {
    imageWidth = meta.height
    imageHeight = meta.width
  }

  const [left, top, width, height] = rect
  if (left + width > imageWidth || top + height > imageHeight) {
    throw new ValidationError('Source rectangle coordinates out of bounds')
  }
}

function fractionParamsToPixels(params, meta) {
  if (params.width && params.width <= 1) {
    params.width *= meta.width
  }

  if (params.height && params.height <= 1) {
    params.height *= meta.height
  }
}

function mapOutputFormat(params, meta, config) {
  // If the user has explicitly defined a format, skip
  const format = params.output && params.output.format
  if (format) {
    return
  }

  // If we have defined a mapping of input => output formats,
  // see if we should rework this format
  const outputFormat = config.inputFormatMap && config.inputFormatMap[meta.format]
  if (outputFormat) {
    params.output = Object.assign(params.output || {}, {
      format: outputFormat,
      mime: `image/${outputFormat}`
    })
  }
}
