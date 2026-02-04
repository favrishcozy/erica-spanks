export const theme = {
  colors: {
    // Primary brand colors - Beige, White, Black theme
    primary: '#C9A876',       // Beige - main brand color
    primaryDark: '#1a1a1a',   // Black for contrast
    primaryLight: '#E8D4B8',  // Light beige for backgrounds
    
    // Secondary colors
    secondary: '#000000',     // Pure black for contrast
    accent: '#1a1a1a',        // Black accent
    blush: '#E8D4B8',         // Soft beige
    nude: '#C9A876',          // Beige tone
    rose: '#1a1a1a',          // Black for urgency/accents
    
    // Neutral colors
    white: '#FFFFFF',
    offWhite: '#FAFAFA',      // Clean off-white
    cream: '#FFF8F0',         // Warm cream background
    lightGray: '#F5F5F5',
    mediumGray: '#E0E0E0',
    darkGray: '#757575',
    black: '#000000',         // Pure black for text
    charcoal: '#2C2C2C',      // Softer charcoal for secondary text
    
    // Status colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  fonts: {
    primary: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: '"Playfair Display", Georgia, serif',
  },
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px (for hero sections)
  },
  
  breakpoints: {
    mobile: '320px',
    smallMobile: '480px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1024px',
    wide: '1440px',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
  },
  
  borderRadius: {
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px',   // circular
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1050,
    tooltip: 1070,
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
}
