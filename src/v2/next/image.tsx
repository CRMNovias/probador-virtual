import type { ImgHTMLAttributes } from 'react';

/**
 * `next/image` para la V2 dentro de la V1: una <img> normal. `fill` la estira
 * sobre su contenedor (que es `relative`) y `priority` la carga sin esperar.
 */
type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
};

export default function Image({ fill = false, priority = false, className = '', width, height, ...rest }: ImageProps) {
  return (
    <img
      {...rest}
      {...(fill ? {} : { width, height })}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={fill ? `absolute inset-0 h-full w-full ${className}` : className}
    />
  );
}
