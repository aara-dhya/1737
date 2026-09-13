import React from 'react';

/**
 * NcursesFrame: Emulates a vintage ncurses panel container using ASCII box drawing characters
 * (e.g. ┌─┐ │ └─┘ ├─┤) and strict 1px green borders.
 */
export default function NcursesFrame({ title, children, className = '', headerExtra = null }) {
  return (
    <div className={`border border-green-400 bg-black text-green-400 font-mono relative flex flex-col ${className}`}>
      {/* Top Header Bar with ASCII framing */}
      <div className="bg-green-400 text-black px-2 py-0.5 font-bold flex justify-between items-center text-xs uppercase tracking-wider select-none shrink-0">
        <div className="flex items-center space-x-1">
          <span>┌─[</span>
          <span className="font-extrabold">{title}</span>
          <span>]</span>
        </div>
        {headerExtra && <div className="text-black font-bold text-xs">{headerExtra}</div>}
      </div>

      {/* Panel Body Content */}
      <div className="p-3 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
