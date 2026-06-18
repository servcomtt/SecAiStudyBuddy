declare module 'next/link' {
  import * as React from 'react';

  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
  };

  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;

  export default Link;
}

declare module 'next/navigation' {
  export function notFound(): never;
  export function redirect(url: string): never;
  export function usePathname(): string;
}
