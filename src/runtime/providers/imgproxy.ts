import { ProviderGetImage } from 'src'
import { joinURL } from 'ufo'
import { createOperationsGenerator } from '~image'
const JS_SHA = require('jssha')

export const operationsGenerator = createOperationsGenerator({
  keyMap: {
    fit: 'rt',
    resizing_type: 'rt',
    width: 'w',
    height: 'h',
    dpr: 'dpr',
    enlarge: 'el',
    extend: 'ex',
    gravity: 'g',
    crop: 'c',
    padding: 'pd',
    trim: 't',
    rotate: 'rot',
    quality: 'q',
    max_bytes: 'mb',
    background: 'bg',
    blur: 'bl',
    sharpen: 'sh',
    watermark: 'wm',
    preset: 'pr',
    cachebuster: 'cb',
    strip_metadata: 'sm',
    strip_color_profile: 'scp',
    auto_rotate: 'ar',
    filename: 'fn',
    format: 'f',
    // PRO VERSION PARAMS
    resizing_algorithm: 'ra',
    background_alpha: 'bga',
    adjust: 'a',
    brightness: 'br',
    contrast: 'co',
    saturation: 'sa',
    pixelate: 'pix',
    unsharpening: 'ush',
    watermark_url: 'wmu',
    style: 'st',
    jpeg_options: 'jpgo',
    png_options: 'pngo',
    gif_options: 'gifo',
    page: 'pg',
    video_thumbnail_second: 'vts'
  },
  joinWith: '/',
  formatter: (key, value) => {
    /**
     * Some params can contain multiple parameters (colon separated), like:
     * gravity:%type:%x_offset:%y_offset
     */
    const PARAMS = Array.isArray(value) ? value.join(':') : value
    return `${key}:${PARAMS}`
  }
})

const base64Encode = (val: string) => {
  if (process.client) {
    return btoa(val)
  } else if (process.server) {
    return Buffer.from(val).toString('base64')
  } else {
    return val
  }
}

export const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL = '/imgproxy', IMGPROXY_SALT } = {}) => {
  const PATH = joinURL(operationsGenerator(modifiers), base64Encode(src))
  let signature = 'insecure'

  /**
   * Calculate URL signature if IMGPROXY_SALT and signatureGenerator are provided
   * https://docs.imgproxy.net/signing_the_url?id=calculating-url-signature
   */
  if (IMGPROXY_SALT && JS_SHA) {
    const preSignedPath = joinURL(IMGPROXY_SALT, PATH)
    signature = JS_SHA(preSignedPath)
  }

  return {
    url: joinURL(baseURL, signature, PATH)
  }
}
