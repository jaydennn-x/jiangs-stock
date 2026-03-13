'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

interface ProtectedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  quality?: number
}

export function ProtectedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  quality,
}: ProtectedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      quality={quality}
      className={cn('select-none', className)}
      draggable={false}
      unoptimized={false}
      onContextMenu={e => e.preventDefault()}
      onDragStart={e => e.preventDefault()}
    />
  )
}
