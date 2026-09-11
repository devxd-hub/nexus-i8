/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLOR_TOKENS = {
  warmBg: '#F3EEE5',
  deepBlack: '#0A0A09',
  secondaryDark: '#151311',
  nexusOrange: '#EF5A2A',
  mutedText: '#66615A',
  lightLine: 'rgba(10, 10, 9, 0.12)',
  lightLineDarker: 'rgba(10, 10, 9, 0.24)',
} as const;

export const SPACING_TOKENS = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
  '5xl': '96px',
  '6xl': '120px',
  '7xl': '160px',
} as const;

export const LAYOUT_TOKENS = {
  maxWidth: '1440px',
  containerPadding: 'px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16',
  sectionPadding: 'py-16 md:py-24 lg:py-32',
  sectionPaddingSm: 'py-12 md:py-16 lg:py-20',
} as const;
