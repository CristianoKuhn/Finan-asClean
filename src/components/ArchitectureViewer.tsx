/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Database, 
  Cpu, 
  ShieldAlert, 
  Compass, 
  Activity, 
  Check, 
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Archive,
  Maximize2
} from 'lucide-react';
import { ARCHITECTURE_SECTIONS } from '../data/architectureDocs';

export default function ArchitectureViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'arquitetura' | 'database' | 'integration' | 'seguranca' | 'futuro'>('all');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('arquitetura_global');

  const categories = [
    { value: 'all', label: 'Tudo', icon: BookOpen },
    { value: 'arquitetura', label: 'Arquitetura e SOLID', icon: Layers },
    { value: 'database', label: 'Planilhas (Banco)', icon: Database },
    { value: 'integration', label: 'API & FlutterFlow', icon: Cpu },
    { value: 'seguranca', label: 'Segurança & Cripto', icon: ShieldAlert },
    { value: 'futuro', label: 'Performance & Futuro', icon: Compass },
  ];

  const filteredSections = useMemo(() => {
    return ARCHITECTURE_SECTIONS.filter(section => {
      const matchesCategory = activeCategory === 'all' || section.category === activeCategory;
      const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            section.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="space-y-6" id="architecture-viewer-container">
      {/* Subheader and Category filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">Especificações do Projeto</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inspeção profunda de engenharia e modelagem técnica de software</p>
          </div>

          {/* Search bar inside specifications */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar especificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-lg text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Category horizontal filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid containing architectural checklist and reading panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left list of architectural requirements (1/3 size) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:col-span-1 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            Dossiê de Arquitetura (15 Tópicos)
          </h4>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredSections.map(section => (
              <button
                key={section.id}
                onClick={() => setExpandedSectionId(section.id)}
                className={`w-full flex items-start gap-2.5 px-3 py-3 rounded-lg text-left transition-all cursor-pointer ${
                  expandedSectionId === section.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                  expandedSectionId === section.id ? 'text-teal-500' : 'text-slate-300 dark:text-slate-700'
                }`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold leading-tight">{section.title}</p>
                  <span className="text-[9px] uppercase tracking-wide font-bold opacity-60">
                    {section.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right deep-dive reader block with beautiful layout (2/3 size) */}
        <div className="lg:col-span-2">
          {expandedSectionId ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs min-h-[540px] space-y-4">
              {(() => {
                const sect = ARCHITECTURE_SECTIONS.find(s => s.id === expandedSectionId);
                if (!sect) return null;
                
                return (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <span className="text-[9px] bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                        {sect.category}
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-2.5 font-display">
                        {sect.title}
                      </h2>
                    </div>

                    {/* Styled Markdown content parsing */}
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                      {sect.content.split('\n\n').map((paragraph, idx) => {
                        // Check if it is a block code / ASCII flow
                        if (paragraph.startsWith('```')) {
                          const lines = paragraph.replace(/```/g, '').split('\n').filter(Boolean);
                          const lang = lines[0] === 'text' || lines[0] === 'json' ? lines.shift() : '';
                          return (
                            <div key={idx} className="bg-slate-900 text-slate-200 rounded-lg p-4 font-mono text-[10px] overflow-x-auto border border-slate-850 my-3">
                              <pre>{lines.join('\n')}</pre>
                            </div>
                          );
                        }

                        // Check if it is a list
                        if (paragraph.startsWith('*') || paragraph.startsWith('-') || paragraph.match(/^\d+\./)) {
                          const items = paragraph.split('\n');
                          return (
                            <ul key={idx} className="space-y-2 pl-4 list-disc marker:text-teal-500 my-2">
                              {items.map((item, itemIdx) => {
                                const cleanItem = item.replace(/^[\s*-]+/, '').replace(/^\d+\.\s*/, '');
                                
                                // Bold parsing
                                const boldSplit = cleanItem.split('**');
                                if (boldSplit.length > 2) {
                                  return (
                                    <li key={itemIdx}>
                                      {boldSplit[0]}
                                      <strong className="font-bold text-slate-950 dark:text-white">{boldSplit[1]}</strong>
                                      {boldSplit[2]}
                                    </li>
                                  );
                                }
                                return <li key={itemIdx}>{cleanItem}</li>;
                              })}
                            </ul>
                          );
                        }

                        // Check if it is a secondary title h3/h4
                        if (paragraph.startsWith('###')) {
                          return (
                            <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-white font-display pt-3 pb-1 border-b border-slate-50 dark:border-slate-800/40">
                              {paragraph.replace('###', '').trim()}
                            </h3>
                          );
                        }
                        if (paragraph.startsWith('##')) {
                          return (
                            <h4 key={idx} className="text-base font-bold text-slate-900 dark:text-white font-display pt-4 pb-1">
                              {paragraph.replace('##', '').trim()}
                            </h4>
                          );
                        }

                        // Parsing single bold highlights inside paragraph
                        const boldSplit = paragraph.split('**');
                        if (boldSplit.length > 2) {
                          return (
                            <p key={idx}>
                              {boldSplit[0]}
                              <strong className="font-bold text-slate-950 dark:text-white">{boldSplit[1]}</strong>
                              {boldSplit.slice(2).join('')}
                            </p>
                          );
                        }

                        return <p key={idx}>{paragraph}</p>;
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center text-slate-400 min-h-[540px]">
              <BookOpen className="w-12 h-12 stroke-[1.5] text-slate-300 dark:text-slate-700 animate-bounce" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mt-4">Selecione uma especificação</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">Navegue pelas 15 diretrizes do Arquiteto Sênior para ver diagramas e explicações detalhadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
