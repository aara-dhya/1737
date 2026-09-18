import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function NcursesFrame({ title, children, className = '', headerExtra = null }) {
  const { theme } = useTheme();

  return (
    <div className={`border ${theme.border} ${theme.bg} ${theme.text} font-mono relative flex flex-col ${className}`}>
      {/* Top Header Bar with ASCII framing */}
      <div className={`${theme.headerBg} ${theme.headerText} px-2 py-0.5 font-bold flex justify-between items-center text-xs uppercase tracking-wider select-none shrink-0`}>
        <div className="flex items-center space-x-1">
          <span>┌─[</span>
          <span className="font-extrabold">{title}</span>
          <span>]</span>
        </div>
        {headerExtra && <div className={`${theme.headerText} font-bold text-xs`}>{headerExtra}</div>}
      </div>

      {/* Panel Body Content */}
      <div className={`p-3 flex-1 overflow-auto ${theme.bg}`}>
        {children}
      </div>
    </div>
  );
}
