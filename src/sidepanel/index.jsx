import React from 'react';
import ReactDOM from 'react-dom/client';

import { SidePanelApp } from '../components/SidePanelApp';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '../styles.css';

// 2.2 Design System: Implement Material Design 3 (M3) by creating a basic theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // You can customize colors here to match the M3 spec
    primary: {
      main: '#bb86fc', // Example primary color
    },
    secondary: {
      main: '#03dac6', // Example secondary color
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SidePanelApp />
    </ThemeProvider>
  </React.StrictMode>,
);