'use client';

import { useMemo } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export interface TreeColors {
  parentChild: string;
  adoptive: string;
  spouse: string;
  siblingBond: string;
  bg: string;
  border: string;
  borderLight: string;
  male: string;
  female: string;
  neutral: string;
  buttonText: string;
  minimapMask: string;
  labelBg: string;
}

/**
 * Hook to get theme-aware tree colors.
 * Reads CSS custom properties from the computed style.
 */
export function useTreeColors(): TreeColors {
  const { theme } = useTheme();

  return useMemo(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    const activeTheme = root?.getAttribute('data-theme') ?? theme;
    const styles = root ? getComputedStyle(root) : null;
    const isLight = activeTheme === 'light';

    const getCSSVar = (name: string): string => {
      if (!styles) return '';
      return styles.getPropertyValue(name).trim();
    };

    return {
      parentChild: getCSSVar('--tree-parent-child') || (isLight ? '#0052cc' : '#4a90d9'),
      adoptive: getCSSVar('--tree-adoptive') || (isLight ? '#0891b2' : '#38bdf8'),
      spouse: getCSSVar('--tree-spouse') || '#db2777',
      siblingBond: getCSSVar('--tree-sibling-bond') || (isLight ? '#7c3aed' : '#c084fc'),
      bg: getCSSVar('--tree-bg') || (isLight ? '#ffffff' : '#1f1118'),
      border: getCSSVar('--tree-border') || (isLight ? '#e5d8e5' : '#3d2535'),
      borderLight: getCSSVar('--tree-border-light') || (isLight ? '#d1b3d1' : '#5a3548'),
      male: getCSSVar('--tree-male') || (isLight ? '#0052cc' : '#4a90d9'),
      female: getCSSVar('--tree-female') || '#db2777',
      neutral: getCSSVar('--tree-neutral') || (isLight ? '#999999' : '#5a3548'),
      buttonText: getCSSVar('--tree-button-text') || (isLight ? '#666666' : '#9d8090'),
      minimapMask: getCSSVar('--tree-minimap-mask') || (isLight ? 'rgba(253, 245, 249, 0.75)' : 'rgba(24, 13, 18, 0.75)'),
      labelBg: getCSSVar('--tree-bg') || (isLight ? '#ffffff' : '#1f1118'),
    };
  }, [theme]);
}
