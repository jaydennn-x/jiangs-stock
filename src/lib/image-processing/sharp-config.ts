import sharp from 'sharp'
import { SHARP_LIMIT_INPUT_PIXELS } from '@/lib/constants'

const concurrency = Number(process.env.SHARP_CONCURRENCY) || 2

sharp.concurrency(concurrency)

/**
 * Create a sharp instance with global settings applied.
 * limitInputPixels is set per-instance as it's not a static method in Sharp 0.34.x.
 */
export function createSharpInstance(
  input: string | Buffer,
  options?: sharp.SharpOptions
): sharp.Sharp {
  return sharp(input, {
    limitInputPixels: SHARP_LIMIT_INPUT_PIXELS,
    ...options,
  })
}

export default sharp
