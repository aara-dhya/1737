import React, { useState } from 'react';
import NcursesFrame from './NcursesFrame';
import { useTheme } from '../context/ThemeContext';

export default function AuthScreen({ onLogin }) {
  const { theme, mode } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === 'admin' && password === 'quant2026') {
        onLogin();
      } else {
        setError('ACCESS DENIED: INVALID CREDENTIALS');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className={`h-full w-full flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <NcursesFrame title="SYSTEM AUTHENTICATION" headerExtra="[ SECURE CONNECTION ]">
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            <div className="text-center space-y-2 mb-6">
              <div className={`text-lg font-bold ${theme.text}`}>INSTITUTIONAL QUANT TERMINAL</div>
              <div className={`text-[10px] ${theme.textMuted}`}>UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${theme.text}`}>USERNAME:</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full bg-transparent border ${theme.borderMuted} p-2 text-xs focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
                  placeholder="admin"
                  autoFocus
                />
              </div>
              
              <div>
                <label className={`block text-xs font-bold mb-1 ${theme.text}`}>PASSWORD:</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-transparent border ${theme.borderMuted} p-2 text-xs focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 font-bold text-xs text-center animate-pulse">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full p-2 text-xs font-bold ${theme.btnClass} ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? '[ AUTHENTICATING... ]' : '[ INITIATE HANDSHAKE ]'}
            </button>
            
            <div className={`text-center text-[10px] ${theme.textMuted} mt-4`}>
              Hint: admin / quant2026
            </div>
          </form>
        </NcursesFrame>
      </div>
    </div>
  );
}
