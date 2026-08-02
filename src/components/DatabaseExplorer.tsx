/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Database, Table, HelpCircle, Key, Link as LinkIcon, Download, Check } from 'lucide-react';
import { GOOGLE_SHEETS_SCHEMA } from '../data/dbSchema';

export default function DatabaseExplorer() {
  const [selectedSheetId, setSelectedSheetId] = useState('lancamentos');
  const [copied, setCopied] = useState(false);

  const activeTable = GOOGLE_SHEETS_SCHEMA.find(t => t.id === selectedSheetId) || GOOGLE_SHEETS_SCHEMA[5];

  const handleExportData = (format: 'json' | 'csv') => {
    let content = '';
    let fileName = `${activeTable.id}_export.${format}`;

    if (format === 'json') {
      content = JSON.stringify(activeTable.sampleRows, null, 2);
    } else {
      // CSV Export
      const headers = activeTable.columns.map(c => c.name).join(',');
      const rows = activeTable.sampleRows.map(row => {
        return activeTable.columns.map(c => {
          const val = row[c.name];
          if (val === undefined || val === null) return '';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
      });
      content = [headers, ...rows].join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySheetName = () => {
    navigator.clipboard.writeText(activeTable.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="database-explorer">
      {/* Sidebar navigation list for the 14 sheets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 lg:col-span-1 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-teal-500" />
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Tabelas GSheets</h3>
            <p className="text-[10px] text-slate-400">14 Abas de Banco de Dados</p>
          </div>
        </div>

        {/* Vertical Sheet Buttons */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
          {GOOGLE_SHEETS_SCHEMA.map(sheet => (
            <button
              key={sheet.id}
              onClick={() => setSelectedSheetId(sheet.id)}
              id={`sheet-nav-${sheet.id}`}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all text-left ${
                selectedSheetId === sheet.id
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Table className="w-3.5 h-3.5 opacity-70" />
                {sheet.name}
              </span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">
                {sheet.columns.length} col
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main visual sheet table structure detail */}
      <div className="lg:col-span-3 space-y-6">
        {/* Info panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Aba: {activeTable.name}</h3>
                <button
                  onClick={handleCopySheetName}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-500 rounded font-medium transition-all"
                >
                  {copied ? 'Copiado!' : 'Copiar Nome'}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeTable.description}</p>
            </div>

            {/* Export data triggers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportData('json')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> JSON
              </button>
              <button
                onClick={() => handleExportData('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          {activeTable.formulaNote && (
            <div className="p-3 bg-purple-50 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/40 rounded-lg flex gap-2 items-start text-xs text-purple-800 dark:text-purple-400 leading-relaxed">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Dica de Performance:</strong> {activeTable.formulaNote}</span>
            </div>
          )}

          {/* Table column definitions list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Definição do Esquema Relacional</h4>
            
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2.5 px-3">Coluna</th>
                    <th className="py-2.5 px-3">Tipo de Dado</th>
                    <th className="py-2.5 px-3">Chave</th>
                    <th className="py-2.5 px-3">Descrição / Comportamento</th>
                    <th className="py-2.5 px-3 font-mono">Exemplo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeTable.columns.map(col => (
                    <tr key={col.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-300">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{col.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{col.type}</td>
                      <td className="py-2.5 px-3">
                        {col.keyType === 'PK' ? (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded w-max">
                            <Key className="w-3 h-3" /> PK
                          </span>
                        ) : col.keyType === 'FK' ? (
                          <span className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded w-max">
                            <LinkIcon className="w-3 h-3" /> FK ({col.refTable})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">{col.description}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{col.sampleValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Grid row visualizer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visualização de Linhas Físicas (Google Sheets View)</h4>
          
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 px-2 text-center w-8 bg-slate-100 dark:bg-slate-800 font-mono text-[10px] border-r border-slate-200 dark:border-slate-700">A</th>
                  {activeTable.columns.map((c, idx) => (
                    <th key={c.name} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">
                      {String.fromCharCode(66 + idx)} <br />
                      <span className="text-slate-900 dark:text-white font-bold">{c.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Header row index representing row 1 in google sheets */}
                <tr className="bg-slate-100 dark:bg-slate-800/30">
                  <td className="py-2 px-2 text-center bg-slate-200 dark:bg-slate-800 font-bold border-r border-slate-200 dark:border-slate-700 font-mono">1</td>
                  {activeTable.columns.map(c => (
                    <td key={c.name} className="py-2 px-3 border-r border-slate-100 dark:border-slate-800 font-mono text-slate-400 text-[10px] font-bold">
                      {c.name}
                    </td>
                  ))}
                </tr>

                {/* Actual mock spreadsheet rows starting at index 2 */}
                {activeTable.sampleRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-2 px-2 text-center bg-slate-100 dark:bg-slate-800 font-bold border-r border-slate-200 dark:border-slate-700 font-mono">
                      {rowIdx + 2}
                    </td>
                    {activeTable.columns.map(c => {
                      const val = row[c.name];
                      const valString = typeof val === 'object' ? JSON.stringify(val) : String(val);
                      return (
                        <td key={c.name} className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px] truncate max-w-[180px] text-slate-700 dark:text-slate-300">
                          {valString}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Relações de chaves gerenciadas por herança no Apps Script ORM</span>
            <span>Estilo de tabela indexada otimizada por UUID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
