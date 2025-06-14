export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e'
  },
  
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },
  
  elements: {
    nonmetal: '#1f2937',
    nobleGas: '#7c3aed',
    alkaliMetal: '#dc2626',
    alkalineEarthMetal: '#ea580c',
    metalloid: '#059669',
    postTransitionMetal: '#0891b2',
    transitionMetal: '#4338ca',
    lanthanide: '#be185d',
    actinide: '#be123c',
    unknown: '#6b7280'
  }
} as const;

export const TYPOGRAPHY = {
  /** Familias de fuentes */
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    chemical: ['Times New Roman', 'serif']
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  }
} as const;

export const SPACING = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem'
} as const;

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
} as const;

export const BORDER_WIDTH = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px'
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000'
} as const;

export const ANIMATION_DURATION = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms'
} as const;

export const ANIMATION_TIMING = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;

export const KEYFRAMES = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 }
  },
  slideInUp: {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 }
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 }
  },
  scaleIn: {
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 }
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 }
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
  }
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const UI_MESSAGES = {
  loading: {
    calculating: 'Calculando...',
    parsing: 'Analizando fórmula...',
    balancing: 'Balanceando ecuación...',
    loading: 'Cargando...',
    processing: 'Procesando...',
    validating: 'Validando...'
  },
  
  success: {
    calculated: 'Cálculo completado exitosamente',
    balanced: 'Ecuación balanceada correctamente',
    saved: 'Guardado en el historial',
    copied: 'Copiado al portapapeles',
    cleared: 'Campo limpiado',
    exported: 'Datos exportados exitosamente'
  },
  
  error: {
    invalidFormula: 'Fórmula química inválida',
    elementNotFound: 'Elemento no encontrado en la tabla periódica',
    calculationFailed: 'Error en el cálculo',
    networkError: 'Error de conexión',
    parssingError: 'Error al analizar la fórmula',
    balancingFailed: 'No se pudo balancear la ecuación',
    invalidInput: 'Entrada inválida',
    outOfRange: 'Valor fuera del rango permitido'
  },
  
  warning: {
    largeNumber: 'El número es muy grande, se mostrará en notación científica',
    approximation: 'El resultado es una aproximación',
    unstableElement: 'Este elemento es radiactivo e inestable',
    highConcentration: 'Esta concentración puede ser peligrosa',
    uncertainValue: 'El valor puede tener incertidumbre'
  },
  
  info: {
    enterFormula: 'Ingresa una fórmula química (ej: H2SO4)',
    enterEquation: 'Ingresa una ecuación química (ej: H2 + O2 → H2O)',
    stepsShown: 'Se muestran los pasos del cálculo',
    savedToHistory: 'El cálculo se guardó en el historial',
    clickToCopy: 'Haz clic para copiar',
    pressEnterToCalculate: 'Presiona Enter para calcular'
  },
  
  placeholders: {
    formula: 'Ej: H2SO4, Ca(OH)2, CuSO4·5H2O',
    equation: 'Ej: H2 + O2 = H2O',
    mass: 'Ingresa la masa en gramos',
    moles: 'Ingresa el número de moles',
    volume: 'Ingresa el volumen en litros',
    concentration: 'Ingresa la concentración',
    search: 'Buscar en el historial...',
    notes: 'Agregar notas (opcional)'
  }
} as const;

export const SYMBOLS = {
  chemistry: {
    arrow: '→',
    reverseArrow: '←',
    equilibrium: '⇌',
    plus: '+',
    minus: '-',
    multiply: 'x',
    divide: '÷',
    delta: 'Δ',
    infinity: '∞',
    approximately: '≈',
    proportional: '∝'
  },
  
  math: {
    superscript: {
      0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
      5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
      plus: '⁺', minus: '⁻'
    },
    subscript: {
      0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄',
      5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉',
      plus: '₊', minus: '₋'
    }
  },
  
  state: {
    solid: '(s)',
    liquid: '(l)',
    gas: '(g)',
    aqueous: '(aq)',
    crystal: '(c)'
  }
} as const;

export const COMPONENT_DEFAULTS = {
  button: {
    size: {
      sm: { padding: '6px 12px', fontSize: '14px', borderRadius: '4px' },
      md: { padding: '8px 16px', fontSize: '16px', borderRadius: '6px' },
      lg: { padding: '12px 24px', fontSize: '18px', borderRadius: '8px' }
    },
    variant: {
      primary: { background: COLORS.primary[600], color: 'white' },
      secondary: { background: COLORS.secondary[600], color: 'white' },
      outline: { background: 'transparent', border: `2px solid ${COLORS.primary[600]}` },
      ghost: { background: 'transparent', color: COLORS.primary[600] }
    }
  },
  
  input: {
    size: {
      sm: { padding: '6px 12px', fontSize: '14px' },
      md: { padding: '8px 16px', fontSize: '16px' },
      lg: { padding: '12px 20px', fontSize: '18px' }
    },
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDER_WIDTH[1],
    focusBorderColor: COLORS.primary[500]
  },
  
  card: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    shadow: SHADOWS.md,
    borderWidth: BORDER_WIDTH[1],
    borderColor: COLORS.neutral[200]
  },
  
  modal: {
    backdropColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BORDER_RADIUS.lg,
    shadow: SHADOWS['2xl'],
    maxWidth: '90vw',
    maxHeight: '90vh'
  }
} as const;

export const LAYOUT = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  header: {
    sm: '60px',
    md: '70px',
    lg: '80px'
  },
  
  section: {
    paddingY: SPACING[12],
    paddingX: SPACING[4],
    gap: SPACING[8]
  },
  
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-2',
    cols3: 'grid-cols-3',
    cols4: 'grid-cols-4',
    cols12: 'grid-cols-12'
  }
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  max: 999
} as const;

export const A11Y = {
  timeout: {
    tooltip: 300,
    notification: 5000,
    loading: 30000
  },
  
  minClickSize: '44px',
  
  contrast: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0
  },
  
  focus: {
    outline: `2px solid ${COLORS.primary[500]}`,
    outlineOffset: '2px'
  }
} as const;

export const getColorByCategory = (category: string): string => {
  return COLORS.elements[category as keyof typeof COLORS.elements] || COLORS.elements.unknown;
};

export const formatSubscript = (text: string): string => {
  return text.replace(/(\d)/g, (match) => {
    const digit = parseInt(match);
    return SYMBOLS.math.subscript[digit as keyof typeof SYMBOLS.math.subscript] || match;
  });
};

export const formatSuperscript = (text: string): string => {
  return text.replace(/(\d|\+|\-)/g, (match) => {
    if (match === '+') return SYMBOLS.math.superscript.plus;
    if (match === '-') return SYMBOLS.math.superscript.minus;
    const digit = parseInt(match);
    return SYMBOLS.math.superscript[digit as keyof typeof SYMBOLS.math.superscript] || match;
  });
};