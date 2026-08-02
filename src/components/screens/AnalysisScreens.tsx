/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon, 
  BarChart4, 
  Percent, 
  DollarSign, 
  Award, 
  Info, 
  Sliders, 
  Briefcase, 
  PieChart, 
  ChevronRight, 
  X,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { Investment, Transaction, BankAccount, CreditCard, FinancialGoal, Subscription, InstallmentContract } from '../../types';
import { FinancialEngine } from '../../services/financialEngine';

interface AnalysisScreensProps {
  currentScreen: 'investimentos' | 'calendario' | 'relatorios';
  setScreen: (screen: any) => void;
  transactions: Transaction[];
  investments: Investment[];
  accounts: BankAccount[];
  cards: CreditCard[];
  installments: InstallmentContract[];
  subscriptions: Subscription[];
  goals: FinancialGoal[];
  activeMonth: string;
  onAddInvestment: (inv: Investment) => void;
}

export function AnalysisScreens({
  currentScreen,
  setScreen,
  transactions,
  investments,
  accounts,
  cards,
  installments,
  subscriptions,
  goals,
  activeMonth,
  onAddInvestment
}: AnalysisScreensProps) {
  // Local Compound Interest Simulator state
  const [initValue, setInitValue] = useState<string>('5000');
  const [monthlyValue, setMonthlyValue] = useState<string>('500');
  const [yearsCount, setYearsCount] = useState<string>('5');
  const [interestRate, setInterestRate] = useState<string>('12'); // 12% a.a.

  // Calendar selected day state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Future cash flow active elements simulation (node IDs)
  const [activeTimelineIds, setActiveTimelineIds] = useState<string[]>([]);

  // Investment additions form
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState<'TESOURO' | 'CDB' | 'ACOES' | 'FIIS' | 'CRIPTO'>('CDB');
  const [invInst, setInvInst] = useState('XP Investimentos');
  const [invAmount, setInvAmount] = useState('');

  // 1. COMPOUND INTEREST SIMULATOR CALC
  const simulationResults = useMemo(() => {
    const P = parseFloat(initValue) || 0;
    const PMT = parseFloat(monthlyValue) || 0;
    const t = parseFloat(yearsCount) || 1;
    const rYear = parseFloat(interestRate) || 0;
    
    // Monthly rate
    const rMonthly = Math.pow(1 + rYear / 100, 1 / 12) - 1;
    const n = t * 12;

    let totalInvested = P;
    let balance = P;

    for (let i = 1; i <= n; i++) {
      balance = balance * (1 + rMonthly) + PMT;
      totalInvested += PMT;
    }

    const totalInterest = Math.max(balance - totalInvested, 0);

    return {
      totalInvested,
      totalInterest,
      finalAmount: balance
    };
  }, [initValue, monthlyValue, yearsCount, interestRate]);

  // Handle Add Investment
  const handleAddInvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || !invAmount) return;

    const valNumeric = parseFloat(invAmount);
    const newInv: Investment = {
      id: `inv_${Math.random().toString(36).substring(2, 9)}`,
      name: invName,
      type: invType,
      institution: invInst,
      investedAmount: valNumeric,
      currentAmount: valNumeric,
      yieldRate: '100% CDI',
      yieldProfit: 0
    };
    onAddInvestment(newInv);
    setInvName('');
    setInvAmount('');
  };

  // Portfolio total from FinancialEngine
  const totalPortfolioValue = useMemo(() => {
    return FinancialEngine.calculateTotalInvestments(investments);
  }, [investments]);

  // Calendar grid from FinancialEngine
  const calendarGrid = useMemo(() => {
    return FinancialEngine.getCalendarEvents(activeMonth, transactions, installments, subscriptions);
  }, [activeMonth, transactions, installments, subscriptions]);

  // Timeline nodes from FinancialEngine
  const timelineNodes = useMemo(() => {
    return FinancialEngine.getFutureCashFlowTimeline(accounts, transactions, installments, subscriptions, activeTimelineIds);
  }, [accounts, transactions, installments, subscriptions, activeTimelineIds]);

  const finalProjectedBalance = useMemo(() => {
    if (timelineNodes.length === 0) return 0;
    return timelineNodes[timelineNodes.length - 1].runningBalance;
  }, [timelineNodes]);

  const toggleTimelineId = (id: string) => {
    if (id === 't_base') return;
    setActiveTimelineIds(prev => {
      if (prev.length === 0) {
        // Initialize all active except the clicked one
        const all = timelineNodes.map(n => n.id);
        return all.filter(itemId => itemId !== id);
      }
      return prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id];
    });
  };

  // Historical Cashflow for Reports
  const historicalData = useMemo(() => {
    return FinancialEngine.getHistoricalCashFlow(transactions);
  }, [transactions]);

  // Summary Metrics for Reports
  const monthlySummary = useMemo(() => {
    return FinancialEngine.calculateMonthlySummary(activeMonth, transactions, accounts, cards, installments, subscriptions, goals);
  }, [activeMonth, transactions, accounts, cards, installments, subscriptions, goals]);

  const netWorth = useMemo(() => {
    return FinancialEngine.calculateNetWorth(accounts, investments, cards, transactions, installments);
  }, [accounts, investments, cards, transactions, installments]);

  // 1. SCREEN INVESTIMENTOS
  if (currentScreen === 'investimentos') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Portfólio de Investimentos</h2>
          <p className="text-xs text-slate-400">Gerencie seus aportes e simule cenários de juros compostos em tempo real</p>
        </div>

        {/* Investment summary card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <TrendingUp className="w-64 h-64 text-purple-400" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Patrimônio Investido</p>
              <h2 className="text-3xl font-black text-purple-400 font-display mt-1">
                R$ {(totalPortfolioValue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Sincronizado via Financial Engine</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active investments list */}
          <div className="lg:col-span-2 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-white font-display">Ativos em Carteira</h3>
            
            {investments.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-850/80 space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">Nenhum investimento cadastrado.</p>
                <p className="text-[10px] text-slate-500">Utilize o formulário ao lado para registrar seu primeiro aporte em Renda Fixa ou Variável.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {investments.map(inv => (
                  <div key={inv.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-purple-400 shadow-sm">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{inv.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{inv.type} • {inv.institution}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-white">R$ {(inv.currentAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1.5 py-0.5 rounded font-mono font-bold inline-block mt-0.5">
                        {inv.yieldRate || '100% CDI'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compound Interest Simulator form */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-purple-400" /> Simulador de Juros Compostos
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Calculadora de Acumulação</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Aporte Inicial</label>
                  <input 
                    type="number"
                    value={initValue}
                    onChange={(e) => setInitValue(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Aporte Mensal</label>
                  <input 
                    type="number"
                    value={monthlyValue}
                    onChange={(e) => setMonthlyValue(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Anos</label>
                  <input 
                    type="number"
                    value={yearsCount}
                    onChange={(e) => setYearsCount(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Taxa Anual (%)</label>
                  <input 
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400">Total Investido do Bolso</p>
                  <p className="text-sm font-bold text-slate-200 font-mono">
                    R$ {(simulationResults?.totalInvested ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400">Total Ganho em Juros</p>
                  <p className="text-sm font-bold text-teal-400 font-mono">
                    R$ {(simulationResults?.totalInterest ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-purple-900/40 pt-2 sm:pt-0">
                  <p className="text-[10px] text-purple-300 font-bold">Total Acumulado Final</p>
                  <p className="text-base font-black text-purple-400 font-mono font-display">
                    R$ {(simulationResults?.finalAmount ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Investment form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-max">
            <h3 className="font-bold text-sm text-white font-display">Aportar Novo Ativo</h3>
            
            <form onSubmit={handleAddInvSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Identificação do Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tesouro Direto Selic 2029"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Instituição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: XP Investimentos"
                    value={invInst}
                    onChange={(e) => setInvInst(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Classe de Ativo</label>
                  <select
                    value={invType}
                    onChange={(e: any) => setInvType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  >
                    <option value="CDB">Renda Fixa / CDB</option>
                    <option value="TESOURO">Tesouro Direto</option>
                    <option value="ACOES">Ações Brasil</option>
                    <option value="FIIS">Fundo Imobiliário</option>
                    <option value="CRIPTO">Criptomoedas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Valor Investido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-purple-400 font-mono font-bold rounded-lg text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors text-center"
              >
                Cadastrar Aporte
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCREEN CALENDÁRIO FINANCEIRO
  if (currentScreen === 'calendario') {
    const selectedDayData = selectedDay !== null ? calendarGrid.find(d => d.day === selectedDay) : null;

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-teal-400 font-bold uppercase text-[10px] tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Financial Engine Integration
            </div>
            <h2 className="text-xl font-black text-white font-display mt-0.5">Calendário & Fluxo Futuro</h2>
            <p className="text-xs text-slate-400">Todos os eventos são gerados estritamente pelo banco de dados em tempo real</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">Saldo Projetado Final</span>
            <span className="text-sm font-black text-teal-400 font-mono">
              R$ {(finalProjectedBalance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Calendar view (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-teal-400" /> Grade de Vencimentos ({activeMonth})
              </h3>
            </div>

            {/* Grid Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-bold uppercase">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((item, index) => {
                if (item.day === 0) {
                  return <div key={`empty-${index}`} className="aspect-square bg-slate-950/20 rounded-lg"></div>;
                }

                const hasEvents = item.events.length > 0;
                const hasReceipt = item.events.some(e => e.type === 'RECEITA');
                const hasExpense = item.events.some(e => e.type === 'DESPESA');

                return (
                  <button
                    key={`day-${item.day}`}
                    onClick={() => setSelectedDay(item.day)}
                    className={`aspect-square p-1 rounded-lg border flex flex-col justify-between items-start cursor-pointer transition-all ${
                      selectedDay === item.day 
                        ? 'bg-teal-950/30 border-teal-500 text-teal-400 font-black' 
                        : hasEvents 
                        ? 'bg-slate-950 border-slate-800 text-white hover:border-slate-700' 
                        : 'bg-slate-950/20 border-transparent text-slate-600 hover:border-slate-850'
                    }`}
                  >
                    <span className="text-[11px] font-mono">{item.day}</span>
                    <div className="flex gap-0.5 mt-auto">
                      {hasReceipt && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>}
                      {hasExpense && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block"></span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Event Dialog inside block */}
            {selectedDay !== null && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 animate-in slide-in-from-top-1">
                <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-1.5">
                  <p className="font-bold text-white">Lançamentos do Dia {selectedDay}</p>
                  <button onClick={() => setSelectedDay(null)} className="text-slate-500 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {selectedDayData && selectedDayData.events.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedDayData.events.map((ev, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-slate-900 border border-slate-850 rounded-lg text-xs">
                        <div>
                          <p className="font-semibold text-slate-300">{ev.title}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-mono">{ev.category} • {ev.sourceEntity}</p>
                        </div>
                        <strong className={ev.type === 'RECEITA' ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                          {ev.type === 'RECEITA' ? '+' : '-'} R$ {(ev.amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-lg text-[11px] text-slate-400 text-center">
                    Nenhum lançamento registrado nesta data.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Fluxo de Caixa Futuro (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-teal-400" /> Fluxo de Caixa Futuro (Projeção Real)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Clique nos itens para simular inclusão/exclusão da projeção</p>
              </div>
            </div>

            {timelineNodes.length <= 1 ? (
              <div className="p-8 text-center bg-slate-950/40 border border-slate-850/80 rounded-xl space-y-2">
                <CheckCircle className="w-8 h-8 text-teal-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">Nenhum compromisso pendente no fluxo futuro.</p>
                <p className="text-[10px] text-slate-500">Cadastre despesas parceladas, assinaturas ou recebimentos para ver a projeção do seu saldo.</p>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {timelineNodes.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => toggleTimelineId(item.id)}
                    className={`flex items-start gap-4 p-3 rounded-xl border transition-all cursor-pointer relative z-10 ${
                      item.type === 'BASE' 
                        ? 'bg-slate-950 border-slate-800' 
                        : !item.isIncluded 
                        ? 'bg-slate-950/20 border-dashed border-slate-850/60 opacity-40 hover:opacity-70' 
                        : 'bg-slate-950/60 border-slate-850 hover:bg-slate-950 hover:border-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs font-mono ${
                      item.type === 'BASE' 
                        ? 'bg-slate-950 border-teal-500 text-teal-400 shadow-md shadow-teal-500/10' 
                        : item.type === 'ENTRADA'
                        ? 'bg-slate-950 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-rose-500 text-rose-400'
                    }`}>
                      {item.type === 'BASE' ? 'S' : item.type === 'ENTRADA' ? '+' : '-'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {item.title}
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-slate-400 font-medium">{item.cat}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.date} • {item.type === 'BASE' ? 'Ponto de Partida' : item.isIncluded ? 'Simulado Ativo' : 'Ocultado da Projeção'}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`text-xs font-bold font-mono ${
                            item.type === 'BASE' ? 'text-white' : item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {item.type === 'BASE' ? '' : item.amount > 0 ? '+' : ''}R$ {(item.amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Proj: R$ {(item.runningBalance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // 3. SCREEN RELATÓRIOS
  if (currentScreen === 'relatorios') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Relatórios Financeiros Avançados</h2>
          <p className="text-xs text-slate-400">Análise agregada baseada exclusivamente em dados reais do Financial Engine</p>
        </div>

        {/* Dynamic customized Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white font-display">Performance Fluxo de Caixa Histórico</h3>
          
          <div className="h-64 w-full flex items-end justify-between px-2 pt-6 pb-2 bg-slate-950/30 rounded-xl relative border border-slate-850">
            {/* Grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-850/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-slate-850/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-850/50 pointer-events-none"></div>

            {/* Bars */}
            {historicalData.map((d, index) => {
              const maxVal = 15000;
              const inHeight = Math.min(100, Math.round((d.in / maxVal) * 100));
              const outHeight = Math.min(100, Math.round((d.out / maxVal) * 100));
              return (
                <div key={index} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                  <div className="flex gap-1.5 h-full items-end justify-center w-full">
                    <div 
                      className="w-3 bg-teal-500 rounded-t-sm transition-all" 
                      style={{ height: `${Math.max(5, inHeight)}%` }}
                      title={`Entradas: R$ ${d.in}`}
                    ></div>
                    <div 
                      className="w-3 bg-rose-500 rounded-t-sm transition-all" 
                      style={{ height: `${Math.max(5, outHeight)}%` }}
                      title={`Saídas: R$ ${d.out}`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 text-[10px] text-slate-400 font-mono font-semibold pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-sm"></span> Entradas de Caixa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> Saídas Consolidadas
            </span>
          </div>
        </div>

        {/* Statistical diagnostics metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold">Taxa de Poupança (Mês)</h4>
            <p className="text-2xl font-black font-display text-teal-400">{monthlySummary.savingsRate}%</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Receitas: R$ {(monthlySummary.monthlyIncome ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | 
              Despesas: R$ {(monthlySummary.monthlyExpense ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold">Sobras Líquidas</h4>
            <p className="text-2xl font-black font-display text-white">
              R$ {(monthlySummary.economy ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Saldo excedente livre no mês pronto para aportes ou reserva.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold">Patrimônio Líquido Consol.</h4>
            <p className="text-2xl font-black font-display text-purple-400">
              R$ {(netWorth ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Considera saldo em contas + investimentos - dívidas de cartões e parcelamentos.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
