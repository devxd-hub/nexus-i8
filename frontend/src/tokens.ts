/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLOR_TOKENS = {
  // Semantic Dark Mode System
  bgPrimary: '#0C0C0C',
  bgSecondary: '#141414',
  bgSurface: '#181818',
  bgElevated: '#22201F',
  warmDeep: '#481E14',
  textPrimary: '#F5EFE6',
  textSecondary: '#C2BBB0',
  textMuted: '#857E74',
  borderSubtle: 'rgba(245, 239, 230, 0.10)',
  borderStrong: 'rgba(245, 239, 230, 0.18)',
  accentPrimary: '#F2613F',
  accentHover: '#FA7958',
  accentDark: '#481E14',

  // Backward-compatible mappings
  warmBg: '#0C0C0C',
  deepBlack: '#F5EFE6',
  secondaryDark: '#141414',
  nexusOrange: '#F2613F',
  mutedText: '#C2BBB0',
  lightLine: 'rgba(245, 239, 230, 0.10)',
  lightLineDarker: 'rgba(245, 239, 230, 0.18)',
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
