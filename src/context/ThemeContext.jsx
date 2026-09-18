import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Mode can be 'light' or 'dark'
  const [mode, setMode] = useState('light');

  const toggleMode = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = mode === 'dark';

  // Exact hex theme tokens
  const theme = isDark
    ? {
        mode: 'dark',
        bg: 'bg-[#000000]',
        bgHex: '#000000',
        text: 'text-[#39FF14]',
        textHex: '#39FF14',
        textMuted: 'text-[#00CC00]',
        textMutedHex: '#00CC00',
        border: 'border-[#39FF14]',
        borderHex: '#39FF14',
        borderMuted: 'border-[#005500]',
        headerBg: 'bg-[#39FF14]',
        headerText: 'text-[#000000]',
        boxBg: 'bg-[#001100]',
        boxBgHex: '#001100',
        hoverRow: 'hover:bg-[#39FF14] hover:text-[#000000]',
        btnClass: 'bg-[#000000] text-[#39FF14] border-[#39FF14] hover:bg-[#39FF14] hover:text-[#000000]',
        btnActive: 'bg-[#39FF14] text-[#000000]',
        accentHex: '#39FF14',
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
