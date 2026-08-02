/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  CreditCard as CardIcon, 
  Sliders, 
  CheckCircle, 
  Trash2, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Info, 
  DollarSign, 
  Tag, 
  Play, 
  Tv, 
  Music, 
  CloudRain, 
  ShieldCheck,
  Award,
  X
} from 'lucide-react';
import { FinancialGoal, Subscription, Transaction } from '../../types';

interface PlanningScreensProps {
  currentScreen: 'parcelamentos' | 'assinaturas' | 'metas';
  setScreen: (screen: any) => void;
  goals: FinancialGoal[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  onAddGoal: (goal: FinancialGoal) => void;
  onAddSubscription: (sub: Subscription) => void;
  onDepositToGoal: (id: string, amount: number) => void;
}

export function PlanningScreens({
  currentScreen,
  setScreen,
  goals,
  subscriptions,
  transactions,
  onAddGoal,
  onAddSubscription,
  onDepositToGoal
}: PlanningScreensProps) {
  // Local forms states
  const [goalName, setGoalName] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalCategory, setGoalCategory] = useState('Lazer');

  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCategory, setSubCategory] = useState('Lazer');
  const [subDueDate, setSubDueDate] = useState('15');
  const [subMethod, setSubMethod] = useState('Nubank Ultravioleta');

  // Interactive addition of deposits to goals
  const [depositGoalId, setDepositGoalId] = useState<string>('');
  const [depositValue, setDepositValue] = useState<string>('');

  // Local simulated installments (Parcelamentos)
  const [installments, setInstallments] = useState([
    { id: 'ins_01', item: 'Notebook Dell XPS', totalAmount: 8500.00, parcelValue: 850.00, currentParcel: 4, totalParcels: 10, cardName: 'Nubank Ultravioleta' },
    { id: 'ins_02', item: 'Smartphone iPhone 16 Pro', totalAmount: 7200.00, parcelValue: 600.00, currentParcel: 8, totalParcels: 12, cardName: 'Inter Black' },
    { id: 'ins_03', item: 'Sofá Retrátil Sala', totalAmount: 2400.00, parcelValue: 400.00, currentParcel: 2, totalParcels: 6, cardName: 'Nubank Ultravioleta' }
  ]);
  const [instItem, setInstItem] = useState('');
  const [instTotal, setInstTotal] = useState('');
  const [instParcels, setInstParcels] = useState('10');

  // Monthly Recurring Subscriptions cost
  const subTotalCost = useMemo(() => {
    return subscriptions.reduce((acc, curr) => acc + (curr.active ? curr.amount : 0), 0);
  }, [subscriptions]);

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    const newGoal: FinancialGoal = {
      id: `goal_${Math.random().toString(36).substring(2, 9)}`,
      name: goalName,
      description: goalDesc || 'Meta pessoal de poupança',
      targetAmount: parseFloat(goalTarget),
      currentAmount: parseFloat(goalCurrent || '0'),
      targetDate: '2027-12-31',
      category: goalCategory
    };
    onAddGoal(newGoal);
    setGoalName('');
    setGoalDesc('');
    setGoalTarget('');
    setGoalCurrent('');
  };

  const handleAddSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subAmount) return;

    const icons: Record<string, string> = {
      'Netflix': '🍿',
      'Spotify': '🎵',
      'Prime Video': '🎬',
      'YouTube Premium': '📺',
      'iCloud': '☁️',
      'Adobe Creative Cloud': '🎨'
    };

    const newSub: Subscription = {
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      name: subName,
      amount: parseFloat(subAmount),
      category: subCategory,
      dueDate: parseInt(subDueDate),
      paymentMethod: subMethod,
      active: true,
      logo: icons[subName] || '💎'
    };
    onAddSubscription(newSub);
    setSubName('');
    setSubAmount('');
  };

  const handleAddInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instItem || !instTotal || !instParcels) return;

    const totalVal = parseFloat(instTotal);
    const parCount = parseInt(instParcels);
    const splitVal = parseFloat((totalVal / parCount).toFixed(2));

    const newInst = {
      id: `ins_${Math.random().toString(36).substring(2, 9)}`,
      item: instItem,
      totalAmount: totalVal,
      parcelValue: splitVal,
      currentParcel: 1,
      totalParcels: parCount,
      cardName: 'Nubank Ultravioleta'
    };

    setInstallments(prev => [newInst, ...prev]);
    setInstItem('');
    setInstTotal('');
  };

  const handleGoalDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositValue) return;

    onDepositToGoal(depositGoalId, parseFloat(depositValue));
    setDepositValue('');
    setDepositGoalId('');
  };

  // 1. PARCELAMENTOS SCREEN
  if (currentScreen === 'parcelamentos') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Cronograma de Compras Parceladas</h2>
          <p className="text-xs text-slate-400">Monitore o comprometimento de limite dos cartões de crédito em longo prazo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of active installments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-white font-display">Contratos Parcelados Ativos</h3>
              
              <div className="space-y-3">
                {installments.map(inst => {
                  const progress = Math.round((inst.currentParcel / inst.totalParcels) * 100);
                  const remaining = inst.totalAmount - (inst.parcelValue * inst.currentParcel);
                  return (
                    <div key={inst.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-white">{inst.item}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Cartão: {inst.cardName}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-teal-400">R$ {inst.parcelValue.toFixed(2)} / mês</p>
                          <p className="text-[9px] text-slate-500 font-mono">Total: R$ {inst.totalAmount.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Parcela: {inst.currentParcel} de {inst.totalParcels} ({progress}%)</span>
                        <span>Saldo devedor restante: <strong>R$ {Math.max(remaining, 0).toLocaleString('pt-BR')}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* New Installment Simulator form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-max">
            <h3 className="font-bold text-sm text-white font-display">Registrar Nova Compra</h3>
            
            <form onSubmit={handleAddInstallmentSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Descrição do Bem</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Monitor UltraWide LG"
                  value={instItem}
                  onChange={(e) => setInstItem(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2400,00"
                    value={instTotal}
                    onChange={(e) => setInstTotal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-teal-400 font-bold rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Nº de Parcelas</label>
                  <select
                    value={instParcels}
                    onChange={(e) => setInstParcels(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  >
                    <option value="3">3x</option>
                    <option value="6">6x</option>
                    <option value="10">10x</option>
                    <option value="12">12x</option>
                    <option value="24">24x</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors text-center"
              >
                Cadastrar Parcelas
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. ASSINATURAS SCREEN
  if (currentScreen === 'assinaturas') {
    return (
      <div className="space-y-6">
        {/* Cost banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <Tv className="w-64 h-64 text-indigo-400" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Custo de Assinaturas Ativas</p>
              <h2 className="text-3xl font-black text-indigo-400 font-display mt-1">
                R$ {subTotalCost.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ mês</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Monitoramento de pagamentos recorrentes e débitos em fatura</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of active subscriptions */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-white font-display">Controle de Serviços</h3>
            
            <div className="divide-y divide-slate-800">
              {subscriptions.map(sub => (
                <div key={sub.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-lg shadow-sm">
                      {sub.logo}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{sub.name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 inline text-slate-500" /> Vence dia {sub.dueDate} • Débito automático
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-xs font-bold text-white">R$ {sub.amount.toFixed(2)}/mês</p>
                      <p className="text-[9px] text-slate-500 font-mono">{sub.paymentMethod}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-900/40">
                      Ativo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Subscription form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-max">
            <h3 className="font-bold text-sm text-white font-display">Nova Assinatura</h3>

            <form onSubmit={handleAddSubSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Nome do Serviço</label>
                <select
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Spotify">Spotify</option>
                  <option value="Prime Video">Prime Video</option>
                  <option value="YouTube Premium">YouTube Premium</option>
                  <option value="iCloud">iCloud 200GB</option>
                  <option value="Adobe Creative Cloud">Adobe Creative Cloud</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Mensalidade (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="39,90"
                    value={subAmount}
                    onChange={(e) => setSubAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Dia de Cobrança</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={subDueDate}
                    onChange={(e) => setSubDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors text-center"
              >
                Cadastrar Recorrência
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. METAS SCREEN
  if (currentScreen === 'metas') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Metas de Poupança Soberanas</h2>
          <p className="text-xs text-slate-400">Projete seus sonhos de consumo de forma estruturada e monitorada</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deck of Savings Goals */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(g => {
                const completion = Math.round((g.currentAmount / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{g.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{g.description}</p>
                      </div>
                      <span className="text-xs font-bold text-teal-400 font-mono bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                        {completion}%
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Saldo: R$ {g.currentAmount.toLocaleString('pt-BR')}</span>
                        <span>Alvo: R$ {g.targetAmount.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex justify-between items-center">
                      <span className="text-[9px] text-slate-500">Categoria: {g.category}</span>
                      <button 
                        onClick={() => {
                          setDepositGoalId(g.id);
                        }}
                        className="text-xs font-bold text-teal-400 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        Aportar <Plus className="w-3.5 h-3.5 inline" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick deposit micro-interaction widget */}
            {depositGoalId && (
              <div className="p-4 bg-slate-900 border border-teal-500/30 rounded-2xl space-y-3 animate-in slide-in-from-top-1">
                <div className="flex justify-between items-center text-xs">
                  <p className="font-bold text-white flex items-center gap-1">
                    <Award className="w-4 h-4 text-teal-400" /> Aporte para: {goals.find(g => g.id === depositGoalId)?.name}
                  </p>
                  <button onClick={() => setDepositGoalId('')} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGoalDepositSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="Valor do aporte (R$)"
                      value={depositValue}
                      onChange={(e) => setDepositValue(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-400 font-mono"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-teal-600 transition-all cursor-pointer"
                  >
                    Confirmar Aporte
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Add Goal form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-max">
            <h3 className="font-bold text-sm text-white font-display">Criar Nova Meta</h3>
            
            <form onSubmit={handleAddGoalSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Título do Alvo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva Emergência"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: 6 meses de custo fixo"
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Alvo (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="30000,00"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-teal-400 font-bold font-mono rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Início (R$)</label>
                  <input
                    type="number"
                    placeholder="12000,00"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors text-center"
              >
                Criar Alvo Financeiro
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
