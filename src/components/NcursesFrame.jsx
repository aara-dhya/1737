import React from 'react';

/**
 * NcursesFrame: Emulates a vintage ncurses panel container in strict Light Mode palette
 * (#FCEDF2 background, #B984DF primary, #C095E4 secondary, #FFB7C5 border).
 */
export default function NcursesFrame({ title, children, className = '', headerExtra = null }) {
  return (
    <div className={`border border-[#B984DF] bg-[#FCEDF2] text-[#B984DF] font-mono relative flex flex-col ${className}`}>
      {/* Top Header Bar with ASCII framing */}
      <div className="bg-[#B984DF] text-[#FCEDF2] px-2 py-0.5 font-bold flex justify-between items-center text-xs uppercase tracking-wider select-none shrink-0">
        <div className="flex items-center space-x-1">
          <span>┌─[</span>
          <span className="font-extrabold">{title}</span>
          <span>]</span>
        </div>
        {headerExtra && <div className="text-[#FCEDF2] font-bold text-xs">{headerExtra}</div>}
      </div>

      {/* Panel Body Content */}
      <div className="p-3 flex-1 overflow-auto bg-[#FCEDF2]">
        {children}
      </div>
    </div>
  );
}
