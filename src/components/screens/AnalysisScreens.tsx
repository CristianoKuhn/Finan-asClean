/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
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
  AlertTriangle
} from 'lucide-react';
import { Investment, Transaction } from '../../types';

interface AnalysisScreensProps {
  currentScreen: 'investimentos' | 'calendario' | 'relatorios';
  setScreen: (screen: any) => void;
  transactions: Transaction[];
  investments: Investment[];
  onAddInvestment: (inv: Investment) => void;
}

export function AnalysisScreens({
  currentScreen,
  setScreen,
  transactions,
  investments,
  onAddInvestment
}: AnalysisScreensProps) {
  // Local Compound Interest Simulator state
  const [initValue, setInitValue] = useState<string>('5000');
  const [monthlyValue, setMonthlyValue] = useState<string>('500');
  const [yearsCount, setYearsCount] = useState<string>('5');
  const [interestRate, setInterestRate] = useState<string>('12'); // 12% a.a.

  // Calendar selected day state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Future cash flow active elements simulation
  const [activeTimelineIds, setActiveTimelineIds] = useState<string[]>(['t1', 't2', 't3', 't4', 't5']);

  // Investment additions form
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState<'TESOURO' | 'CDB' | 'ACOES' | 'FIIS' | 'CRIPTO'>('CDB');
  const [invInst, setInvInst] = useState('Nubank');
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

  // Calendar Day Events Resolver
  const calendarDays = useMemo(() => {
    const daysArray = [];
    const events: Record<number, { title: string; value: number; type: 'RECEITA' | 'DESPESA' }[]> = {
      1: [{ title: 'Salário Google Inc', value: 12000.00, type: 'RECEITA' }],
      5: [{ title: 'Fatura Nubank UV', value: 2500.00, type: 'DESPESA' }],
      8: [{ title: 'iCloud 200GB', value: 14.90, type: 'DESPESA' }],
      10: [{ title: 'Fatura Inter Black', value: 1200.00, type: 'DESPESA' }],
      15: [{ title: 'Netflix Premium', value: 55.90, type: 'DESPESA' }],
      22: [{ title: 'Spotify Family', value: 24.90, type: 'DESPESA' }],
    };

    // Simulated 31 days grid starting on Saturday (so August 2026 starts with 5 empty spaces)
    const emptyStartSpaces = 5; 
    for (let i = 0; i < emptyStartSpaces; i++) {
      daysArray.push({ day: 0, events: [] });
    }

    for (let day = 1; day <= 31; day++) {
      daysArray.push({
        day,
        events: events[day] || []
      });
    }

    return daysArray;
  }, []);

  // Total balance of portfolio
  const portfolioSummary = useMemo(() => {
    const totalInvested = investments.reduce((acc, curr) => acc + curr.investedAmount, 0);
    return {
      totalInvested
    };
  }, [investments]);

  // 1. SCREEN INVESTIMENTOS
  if (currentScreen === 'investimentos') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Portfólio de Investimentos</h2>
          <p className="text-xs text-slate-400">Gerencie seus aportes e simule cenários de juros compostos</p>
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
                R$ {portfolioSummary.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Sincronizado automaticamente da planilha</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active investments list */}
          <div className="lg:col-span-2 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-white font-display">Ativos em Carteira</h3>
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
                    <p className="text-xs font-bold text-white">R$ {inv.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1.5 py-0.5 rounded font-mono font-bold inline-block mt-0.5">
                      {inv.yieldRate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Compound Interest Simulator form */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Simulador de Juros Compostos</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Aporte Inicial</label>
                  <input
                    type="number"
                    value={initValue}
                    onChange={(e) => setInitValue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-white font-mono rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Mensalidade</label>
                  <input
                    type="number"
                    value={monthlyValue}
                    onChange={(e) => setMonthlyValue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-white font-mono rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Período (Anos)</label>
                  <input
                    type="number"
                    value={yearsCount}
                    onChange={(e) => setYearsCount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-white font-mono rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Taxa (% a.a.)</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-white font-mono rounded text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Simulation visual outcome */}
              <div className="p-4 bg-purple-950/10 border border-purple-900/30 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400">Total Investido</p>
                  <p className="text-sm font-bold text-slate-300 font-mono">
                    R$ {simulationResults.totalInvested.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400">Total Ganho Juros</p>
                  <p className="text-sm font-bold text-teal-400 font-mono">
                    R$ {simulationResults.totalInterest.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-purple-900/40 pt-2 sm:pt-0">
                  <p className="text-[10px] text-purple-300 font-bold">Total Acumulado</p>
                  <p className="text-base font-black text-purple-400 font-mono font-display">
                    R$ {simulationResults.finalAmount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
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
    // Dynamic timeline mock aligned with the user's specification
    const timelineItemsList = [
      { id: 't1', date: 'Hoje', title: 'Saldo de Contas Consolidado', amount: 8532.00, type: 'BASE', cat: 'Saldo' },
      { id: 't2', date: '05/Ago', title: 'Fatura Nubank UV (Alimentação)', amount: -2500.00, type: 'SAIDA', cat: 'Cartão' },
      { id: 't3', date: '10/Ago', title: 'Internet Fibra Vivo', amount: -150.00, type: 'SAIDA', cat: 'Contas' },
      { id: 't4', date: '12/Ago', title: 'Salário Google Inc (Dev)', amount: 12000.00, type: 'ENTRADA', cat: 'Salário' },
      { id: 't5', date: '15/Ago', title: 'Parcela Notebook Dell', amount: -850.00, type: 'SAIDA', cat: 'Parcelas' },
      { id: 't6', date: '20/Ago', title: 'Aporte Tesouro Selic 2029', amount: -1500.00, type: 'SAIDA', cat: 'Investimentos' },
    ];

    // Compute active items and final predicted balance
    const activeProjections = timelineItemsList.map((item, idx) => {
      const isIncluded = activeTimelineIds.includes(item.id);
      let runningBalance = 0;
      if (idx === 0) {
        runningBalance = item.amount;
      } else {
        // Accumulate from previous items
        let sum = timelineItemsList[0].amount;
        for (let i = 1; i <= idx; i++) {
          const prevItem = timelineItemsList[i];
          if (activeTimelineIds.includes(prevItem.id)) {
            sum += prevItem.amount;
          }
        }
        runningBalance = sum;
      }
      return {
        ...item,
        isIncluded,
        runningBalance
      };
    });

    const finalProjectedBalance = activeProjections[activeProjections.length - 1].runningBalance;

    const toggleTimelineId = (id: string) => {
      if (id === 't1') return; // Base balance is always included
      setActiveTimelineIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-teal-400 font-bold uppercase text-[10px] tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Agenda e Projeções Cronológicas
            </div>
            <h2 className="text-xl font-black text-white font-display mt-0.5">Calendário & Fluxo Futuro</h2>
            <p className="text-xs text-slate-400">Acompanhe vencimentos e simule seu saldo em tempo real clicando nas parcelas</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">Saldo Previsto Final (Ago)</span>
            <span className="text-sm font-black text-teal-400 font-mono">
              R$ {finalProjectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Top visual alert bar */}
        <div className="p-3 bg-teal-950/20 border border-teal-900/30 rounded-xl flex items-center justify-between gap-3 text-xs text-teal-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-400" />
            <p className="text-[11px]">
              <strong>Dica do Copiloto:</strong> Seus maiores vencimentos ocorrem na primeira quinzena. O saldo previsto de <strong>R$ {finalProjectedBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong> garante sua meta de investimento!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Calendar view (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-4 h-4 text-teal-400" /> Grade de Vencimentos (Agosto)
              </h3>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Hoje: Dia 02</span>
            </div>

            {/* Grid Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-bold uppercase">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, index) => {
                if (item.day === 0) {
                  return <div key={`empty-${index}`} className="aspect-square bg-slate-950/20 rounded-lg"></div>;
                }

                const hasEvents = item.events.length > 0;
                const hasReceipt = item.events.some(e => e.type === 'RECEITA');
                const hasExpense = item.events.some(e => e.type === 'DESPESA');

                return (
                  <button
                    key={`day-${item.day}`}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDay(item.day);
                      }
                    }}
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
            {selectedDay !== null ? (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 animate-in slide-in-from-top-1">
                <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-1.5">
                  <p className="font-bold text-white">Lançamentos do Dia {selectedDay}/Ago</p>
                  <button onClick={() => setSelectedDay(null)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {calendarDays.find(d => d.day === selectedDay)?.events.map((ev, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-900 border border-slate-850 rounded-lg text-xs">
                      <span className="font-semibold text-slate-300">{ev.title}</span>
                      <strong className={ev.type === 'RECEITA' ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                        {ev.type === 'RECEITA' ? '+' : '-'} R$ {ev.value.toLocaleString('pt-BR')}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-[10px] text-slate-500 text-center">
                💡 Clique em um dia com marcador para abrir detalhes rápidos de faturas.
              </div>
            )}
          </div>

          {/* RIGHT: Fluxo de Caixa Futuro (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-teal-400" /> Fluxo de Caixa Futuro (Simulável)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Clique nos itens para ligar/desligar da projeção</p>
              </div>
              <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400 font-mono">PROVISÓRIO</span>
            </div>

            {/* Step-by-step Cash Flow Timeline */}
            <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {activeProjections.map((item) => (
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
                  {/* Visual Node */}
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs font-mono ${
                    item.type === 'BASE' 
                      ? 'bg-slate-950 border-teal-500 text-teal-400 shadow-md shadow-teal-500/10' 
                      : item.type === 'ENTRADA'
                      ? 'bg-slate-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-rose-500 text-rose-400'
                  }`}>
                    {item.type === 'BASE' ? 'S' : item.type === 'ENTRADA' ? '+' : '-'}
                  </div>

                  {/* Text Description */}
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
                          {item.type === 'BASE' ? '' : item.amount > 0 ? '+' : ''}R$ {item.amount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">Proj: R$ {item.runningBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. Agenda Financeira Mensal (Detailed Obligation schedule) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-4 h-4 text-teal-400" /> Agenda de Compromissos e Investimentos (Vencimentos)
            </h3>
            <span className="text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-slate-400 font-mono font-bold">
              6 Obrigações Ativas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Paychecks / Receipts Category */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-850">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  💰 Recebimentos & Salários
                </span>
                <span className="text-[9px] bg-emerald-950/40 text-emerald-400 px-1.5 rounded font-bold font-mono">R$ 12k</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-900 border border-slate-850/60 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-300">Salário Google Inc</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Previsão: Dia 12/08</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">R$ 12.000</span>
                </div>
              </div>
            </div>

            {/* Bills & Obligations Category */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-850">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  💳 Faturas & Contas Fixas
                </span>
                <span className="text-[9px] bg-rose-950/40 text-rose-400 px-1.5 rounded font-bold font-mono">R$ 3.5k</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-900 border border-slate-850/60 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-300">Fatura Nubank UV</p>
                    <p className="text-[10px] text-rose-400 mt-0.5">Vence: Dia 05/08</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 font-mono">R$ 2.500</span>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-850/60 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-300">Internet Vivo Fibra</p>
                    <p className="text-[10px] text-rose-400 mt-0.5">Vence: Dia 10/08</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 font-mono">R$ 150</span>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-850/60 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-300">Parcela Dell Notebook</p>
                    <p className="text-[10px] text-rose-400 mt-0.5">Vence: Dia 15/08</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 font-mono">R$ 850</span>
                </div>
              </div>
            </div>

            {/* Investments / savings Category */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-850">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  📈 Investimentos Agendados
                </span>
                <span className="text-[9px] bg-purple-950/40 text-purple-400 px-1.5 rounded font-bold font-mono">R$ 1.5k</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-900 border border-slate-850/60 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-300">Aporte Tesouro Direto</p>
                    <p className="text-[10px] text-purple-400 mt-0.5">Data: Dia 20/08</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-400 font-mono">R$ 1.500</span>
                </div>
              </div>
            </div>
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
          <p className="text-xs text-slate-400">Análise agregada de fluxo de caixa e projeção patrimonial</p>
        </div>

        {/* Dynamic customized SVG Graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white font-display">Performance Fluxo de Caixa (Jan - Ago)</h3>
          
          <div className="h-64 w-full flex items-end justify-between px-2 pt-6 pb-2 bg-slate-950/30 rounded-xl relative border border-slate-850">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-850/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-slate-850/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-850/50 pointer-events-none"></div>

            {/* Bars */}
            {[
              { month: 'Jan', in: 10000, out: 6500 },
              { month: 'Fev', in: 10000, out: 5800 },
              { month: 'Mar', in: 10500, out: 7100 },
              { month: 'Abr', in: 11000, out: 6900 },
              { month: 'Mai', in: 11000, out: 5200 },
              { month: 'Jun', in: 12000, out: 8100 },
              { month: 'Jul', in: 12000, out: 6500 },
              { month: 'Ago', in: 12000, out: 5800 },
            ].map((d, index) => {
              const inHeight = Math.round((d.in / 15000) * 100);
              const outHeight = Math.round((d.out / 15000) * 100);
              return (
                <div key={index} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                  <div className="flex gap-1.5 h-full items-end justify-center w-full">
                    {/* Inflow bar green */}
                    <div 
                      className="w-3 bg-teal-500 rounded-t-sm" 
                      style={{ height: `${inHeight}%` }}
                      title={`Entradas: R$ ${d.in}`}
                    ></div>
                    {/* Outflow bar red */}
                    <div 
                      className="w-3 bg-rose-500 rounded-t-sm" 
                      style={{ height: `${outHeight}%` }}
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
            <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold">Taxa Média de Poupança</h4>
            <p className="text-2xl font-black font-display text-teal-400">45.2%</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Você está guardando em média R$ 5.120,00 mensais acima de sua meta de reserva.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold">Consumo vs Sobras</h4>
            <p className="text-2xl font-black font-display text-white">R$ 6.200,00</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Sobras líquidas livres prontas para aporte em Renda Variável ou CDB de liquidez diária.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold">Tempo até Independência</h4>
            <p className="text-2xl font-black font-display text-purple-400">12.8 Anos</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Mantendo seu nível de aporte atual ajustado a 10.5% de rendimento de juros líquidos ao ano.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
