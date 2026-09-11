/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav';
}

/**
 * Global responsive container adhering to the NEXUS design system:
 * - Desktop max-width: 1440px
 * - Responsive horizontal padding:
 *   - Desktop: 48–72px (lg:px-14 xl:px-16)
 *   - Tablet: 32–48px (sm:px-8 md:px-10)
 *   - Mobile: 20–24px (px-5 sm:px-6)
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  id,
  as: Component = 'div',
}) => {
  return (
    <Component
      id={id}
      className={`w-full max-w-[1440px] mx-auto px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 ${className}`}
    >
      {children}
    </Component>
  );
};
