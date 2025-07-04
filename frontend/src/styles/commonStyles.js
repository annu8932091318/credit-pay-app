// Common styling patterns for use across components
const commonStyles = {
  // Card styles
  cardWithHover: {
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-3px)',
    }
  },

  // Section styles
  pageSection: {
    mb: 4,
  },
  
  // Header styles
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  
  // Form container styles
  formContainer: {
    maxWidth: 800,
    mx: 'auto',
    p: { xs: 2, sm: 3 },
  },
  
  // Status chip styles 
  statusChip: {
    borderRadius: '6px',
    fontWeight: 500,
  },
  
  // Data display cards 
  dataDisplayCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    p: 3
  },
  
  // Dashboard metric box
  metricBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    p: 3,
    height: '100%',
    borderRadius: 2
  },
  
  // Dashboard metric value
  metricValue: {
    fontWeight: 600,
    fontSize: '2rem',
    my: 1.5
  },
  
  // Gradient backgrounds
  gradients: {
    primary: 'linear-gradient(45deg, #0a3258 30%, #0f4c81 90%)',
    secondary: 'linear-gradient(45deg, #4a3368 30%, #6a4c93 90%)',
    success: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)',
    error: 'linear-gradient(45deg, #c62828 30%, #d32f2f 90%)',
    warning: 'linear-gradient(45deg, #e65100 30%, #ed6c02 90%)',
    info: 'linear-gradient(45deg, #01579b 30%, #0288d1 90%)',
    
    // Dark mode gradients
    primaryDark: 'linear-gradient(45deg, #5d99c6 30%, #90caf9 90%)',
    secondaryDark: 'linear-gradient(45deg, #ab47bc 30%, #ce93d8 90%)',
    successDark: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
    errorDark: 'linear-gradient(45deg, #ef4444 30%, #f87171 90%)',
    warningDark: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
    infoDark: 'linear-gradient(45deg, #3b82f6 30%, #60a5fa 90%)',
  },
  
  // Button styles
  buttons: {
    primaryAction: {
      fontWeight: 600, 
      px: 3, 
      py: 1,
      borderRadius: 1.5
    }
  },
  
  // Custom shadows
  customShadows: {
    card: (isDark) => isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
    button: (isDark) => isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 8px rgba(0,0,0,0.1)',
    dialog: (isDark) => isDark ? '0 10px 40px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.15)',
  }
};

export default commonStyles;
