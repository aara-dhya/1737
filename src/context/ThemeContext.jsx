import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Mode can be 'light' or 'dark', loaded from localStorage if available
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('quantshell_theme') || 'light';
  });

  const toggleMode = () => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('quantshell_theme', newMode);
      return newMode;
    });
  };

  const isDark = mode === 'dark';

  // Exact hex theme tokens: Dark mode uses soft pastel green #77DD77
  const theme = isDark
    ? {
        mode: 'dark',
        bg: 'bg-[#000000]',
        bgHex: '#000000',
        text: 'text-[#77DD77]',
        textHex: '#77DD77',
        textMuted: 'text-[#61D095]',
        textMutedHex: '#61D095',
        border: 'border-[#77DD77]',
        borderHex: '#77DD77',
        borderMuted: 'border-[#38A368]',
        headerBg: 'bg-[#77DD77]',
        headerText: 'text-[#000000]',
        boxBg: 'bg-[#0A0A0A]',
        boxBgHex: '#0A0A0A',
        hoverRow: 'hover:bg-[#77DD77] hover:text-[#000000]',
        btnClass: 'bg-[#000000] text-[#77DD77] border-[#77DD77] hover:bg-[#77DD77] hover:text-[#000000]',
        btnActive: 'bg-[#77DD77] text-[#000000]',
        accentHex: '#77DD77',
      }
    : {
        mode: 'light',
        bg: 'bg-[#FCEDF2]',
        bgHex: '#FCEDF2',
        text: 'text-[#B984DF]',
        textHex: '#B984DF',
        textMuted: 'text-[#C095E4]',
        textMutedHex: '#C095E4',
        border: 'border-[#B984DF]',
        borderHex: '#B984DF',
        borderMuted: 'border-[#FFB7C5]',
        headerBg: 'bg-[#B984DF]',
        headerText: 'text-[#FCEDF2]',
        boxBg: 'bg-[#FFD1D4]',
        boxBgHex: '#FFD1D4',
        hoverRow: 'hover:bg-[#FFA0C5] hover:text-[#FCEDF2]',
        btnClass: 'bg-[#FCEDF2] text-[#B984DF] border-[#C095E4] hover:bg-[#B984DF] hover:text-[#FCEDF2]',
        btnActive: 'bg-[#B984DF] text-[#FCEDF2]',
        accentHex: '#FFA0C5',
      };

  return (
    <ThemeContext.Provider value={{ mode, isDark, toggleMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
