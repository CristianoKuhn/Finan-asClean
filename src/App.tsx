/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  ShieldCheck
} from 'lucide-react';
import FinanceDashboard from './components/FinanceDashboard';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Sync theme changes with body class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0b0f19]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 rounded-xl shadow-md">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold font-display tracking-tight text-slate-900 dark:text-white">Finanças Clean</h1>
                <span className="text-[9px] bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  SaaS Blueprint v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">O jeito inteligente de cuidar do seu dinheiro.</p>
            </div>
          </div>

          {/* Actions & Theme switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
              title="Alternar Tema Claro/Escuro"
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Server Status: OK
            </span>
          </div>

        </div>
      </header>

      {/* Main Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <FinanceDashboard />
        </div>
      </main>

    </div>
  );
}
