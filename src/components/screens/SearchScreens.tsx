/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard as CardIcon, 
  X, 
  Sliders, 
  Calendar, 
  Info, 
  Check,
  RefreshCw
} from 'lucide-react';
import { Transaction, BankAccount, CreditCard } from '../../types';

interface SearchScreensProps {
  currentScreen: 'pesquisa' | 'filtros';
  setScreen: (screen: any) => void;
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onTriggerEditScreen: (id: string) => void;
}

export function SearchScreens({
  currentScreen,
  setScreen,
  transactions,
  accounts,
  cards,
  onTriggerEditScreen
}: SearchScreensProps) {
  // Global search input state
  const [globalSearch, setGlobalSearch] = useState('');

  // Advanced criteria states
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. GLOBAL SEARCH ALGORITHM
  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];

    const lower = globalSearch.toLowerCase();
    return transactions.filter(t => {
      return (
        t.description.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower) ||
        t.paymentMethod.toLowerCase().includes(lower) ||
        (t.notes && t.notes.toLowerCase().includes(lower))
      );
    });
  }, [globalSearch, transactions]);

  // 2. ADVANCED FILTERS ALGORITHM
  const advancedResults = useMemo(() => {
    return transactions.filter(t => {
      // Min amount check
      if (minAmount && t.amount < parseFloat(minAmount)) return false;
      // Max amount check
      if (maxAmount && t.amount > parseFloat(maxAmount)) return false;
      // Category check
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      // Account check
      if (selectedAccount !== 'all' && t.accountId !== selectedAccount) return false;
      // Method check
      if (selectedMethod !== 'all' && t.paymentMethod !== selectedMethod) return false;
      // Start date check
      if (startDate && t.date < startDate) return false;
      // End date check
      if (endDate && t.date > endDate) return false;

      return true;
    });
  }, [
    transactions,
    minAmount,
    maxAmount,
    selectedCategory,
    selectedAccount,
    selectedMethod,
    startDate,
    endDate
  ]);

  const handleResetAdvancedFilters = () => {
    setMinAmount('');
    setMaxAmount('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedMethod('all');
    setStartDate('');
    setEndDate('');
  };

  // 1. SCREEN PESQUISA GLOBAL
  if (currentScreen === 'pesquisa') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-white font-display">Pesquisa Global Inteligente</h2>
          <p className="text-xs text-slate-400">Varra instantaneamente todas as movimentações e observações da sua planilha</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Ex: Almoço, Supermercado, Salário, Pix..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-teal-400 font-sans"
              autoFocus
            />
          </div>
        </div>

        {/* Results layout */}
        {globalSearch.trim() && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Resultados Encontrados ({globalSearchResults.length})</span>
              <button onClick={() => setGlobalSearch('')} className="text-slate-400 hover:text-white flex items-center gap-0.5">
                Limpar <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {globalSearchResults.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhum registro corresponde aos termos da pesquisa.
                </div>
              ) : (
                globalSearchResults.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onTriggerEditScreen(t.id)}
                    className="py-3 flex items-center justify-between hover:bg-slate-850/30 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        t.type === 'RECEITA' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                          : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                      }`}>
                        {t.type === 'RECEITA' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {t.category} • {t.date.split('-').reverse().join('/')} • {t.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold font-mono ${t.type === 'RECEITA' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'RECEITA' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">Ver detalhes</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. SCREEN FILTROS AVANÇADOS
  if (currentScreen === 'filtros') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Busca com Filtros Avançados</h2>
          <p className="text-xs text-slate-400">Gere relatórios customizados filtrando múltiplos critérios simultâneos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Criteria panels */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-max">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white font-display">Parâmetros de Filtro</h3>
              <button 
                onClick={handleResetAdvancedFilters} 
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
              >
                Limpar Todos <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Range constraints */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Faixa de Valores (R$)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min: 0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white font-mono rounded text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max: 9999"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white font-mono rounded text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Category dropdown filter */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Categoria Alvo</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white rounded text-xs focus:outline-none"
                >
                  <option value="all">Todas</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Salário">Salário</option>
                  <option value="Investimentos">Rendimentos / Investimentos</option>
                </select>
              </div>

              {/* Bank accounts select */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Conta Origem</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white rounded text-xs focus:outline-none"
                >
                  <option value="all">Todas Contas</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Payment methods list */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Forma de Pagamento</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white rounded text-xs focus:outline-none"
                >
                  <option value="all">Todas as Formas</option>
                  <option value="PIX">PIX</option>
                  <option value="TED">TED</option>
                  <option value="CREDITO">Cartão de Crédito</option>
                  <option value="DEBITO">Cartão de Débito</option>
                  <option value="DINHEIRO">Dinheiro Vivo</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>
              </div>

              {/* Date limits constraints */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Período de Datas</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white rounded text-[10px] focus:outline-none"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white rounded text-[10px] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white font-display">Registros Encontrados ({advancedResults.length})</h3>
              <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400">
                Filtros ativos: Sincronia Local
              </span>
            </div>

            <div className="divide-y divide-slate-850 max-h-[380px] overflow-y-auto pr-1">
              {advancedResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Sliders className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-xs font-bold">Nenhum lançamento corresponde à busca.</p>
                  <p className="text-[10px]">Altere ou remova os filtros do menu lateral.</p>
                </div>
              ) : (
                advancedResults.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onTriggerEditScreen(t.id)}
                    className="py-3 flex items-center justify-between hover:bg-slate-850/30 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        t.type === 'RECEITA' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                          : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                      }`}>
                        {t.type === 'RECEITA' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {t.category} • {t.date.split('-').reverse().join('/')} • {t.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold font-mono ${t.type === 'RECEITA' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'RECEITA' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">Ver detalhes</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
