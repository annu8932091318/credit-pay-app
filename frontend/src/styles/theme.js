import { createTheme } from '@mui/material/styles';

// Color constants
const PRIMARY_MAIN = '#3f51b5';   // Paytm-inspired blue
const PRIMARY_LIGHT = '#6573c3';
const PRIMARY_DARK = '#2c387e';

const SECONDARY_MAIN = '#00bcd4';
const SECONDARY_LIGHT = '#33c9dc';
const SECONDARY_DARK = '#008394';

const BACKGROUND_LIGHT = '#f5f5f5';
const BACKGROUND_DARK = '#121212';
const PAPER_LIGHT = '#ffffff';
const PAPER_DARK = '#1e1e1e';

// Status colors
const STATUS_PAID = '#4caf50';     // Green
const STATUS_PENDING = '#ff9800';  // Orange
const STATUS_OVERDUE = '#f44336';  // Red
const STATUS_CANCELLED = '#9e9e9e'; // Gray
const STATUS_PARTIAL = '#8e24aa';   // Purple

// Create MUI theme options
export const getThemeOptions = (mode) => {
  const isDark = mode === 'dark';
  
  return {
    palette: {
      mode,
      primary: {
        main: PRIMARY_MAIN,
        light: PRIMARY_LIGHT,
        dark: PRIMARY_DARK,
        contrastText: '#fff',
      },
      secondary: {
        main: SECONDARY_MAIN,
        light: SECONDARY_LIGHT,
        dark: SECONDARY_DARK,
        contrastText: '#fff',
      },
      background: {
        default: isDark ? BACKGROUND_DARK : BACKGROUND_LIGHT,
        paper: isDark ? PAPER_DARK : PAPER_LIGHT,
      },
      status: {
        paid: STATUS_PAID,
        pending: STATUS_PENDING,
        overdue: STATUS_OVERDUE,
        cancelled: STATUS_CANCELLED,
        partial: STATUS_PARTIAL,
      },
      text: {
        primary: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
      },
    },
    typography: {
      fontFamily: [
        'Poppins',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [...Array(25)].map((_, i) => {
      if (i === 1) {
        return isDark
          ? '0px 2px 1px -1px rgba(255,255,255,0.1),0px 1px 1px 0px rgba(255,255,255,0.05),0px 1px 3px 0px rgba(255,255,255,0.1)'
          : '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.05),0px 1px 3px 0px rgba(0,0,0,0.1)';
      }
      return i === 0 ? 'none' : undefined;
    }),
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0 4px 8px rgba(255, 255, 255, 0.05)'
              : '0 4px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            background: `linear-gradient(45deg, ${PRIMARY_MAIN} 30%, ${PRIMARY_LIGHT} 90%)`,
            '&:hover': {
              background: `linear-gradient(45deg, ${PRIMARY_DARK} 30%, ${PRIMARY_MAIN} 90%)`,
            },
          },
          containedSecondary: {
            background: `linear-gradient(45deg, ${SECONDARY_MAIN} 30%, ${SECONDARY_LIGHT} 90%)`,
            '&:hover': {
              background: `linear-gradient(45deg, ${SECONDARY_DARK} 30%, ${SECONDARY_MAIN} 90%)`,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            background: `linear-gradient(45deg, ${PRIMARY_DARK} 30%, ${PRIMARY_MAIN} 90%)`,
          },
        },
      },
    },
  };
};

// Create and export both themes
export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme = createTheme(getThemeOptions('dark'));

export default lightTheme;
