import type { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { withBase } from '@v2/lib/base-path';

/**
 * `next/link` para la V2 dentro de la V1: el mismo componente con React Router.
 * Las rutas de la V2 (`/probador`, `/coleccion`…) llevan el prefijo /v2; las
 * externas (`https:`, `tel:`, `mailto:`) se dejan tal cual.
 */
type LinkProps = Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string };

const isExternal = (href: string) => /^[a-z]+:/i.test(href) || href.startsWith('//');

export default function Link({ href, ...rest }: LinkProps) {
  if (isExternal(href)) return <a href={href} {...rest} />;
  return <RouterLink to={withBase(href)} {...rest} />;
}
