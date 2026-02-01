import { DefaultTheme } from 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string
      primaryDark: string
      primaryLight: string
      secondary: string
      accent: string
      blush: string
      nude: string
      rose: string
      white: string
      offWhite: string
      cream: string
      lightGray: string
      mediumGray: string
      darkGray: string
      black: string
      charcoal: string
      success: string
      error: string
      warning: string
      info: string
    }
    fonts: {
      primary: string
      secondary: string
    }
    fontSizes: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
    }
    fontWeights: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
      extrabold: number
    }
    lineHeights: {
      tight: number
      normal: number
      relaxed: number
    }
    spacing: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
    }
    breakpoints: {
      mobile: string
      smallMobile: string
      tablet: string
      laptop: string
      desktop: string
      wide: string
    }
    shadows: {
      sm: string
      md: string
      lg: string
      xl: string
    }
    borderRadius: {
      sm: string
      md: string
      lg: string
      xl: string
      full: string
    }
    zIndex: {
      dropdown: number
      sticky: number
      fixed: number
      modal: number
      tooltip: number
    }
    transitions: {
      fast: string
      normal: string
      slow: string
    }
  }
}