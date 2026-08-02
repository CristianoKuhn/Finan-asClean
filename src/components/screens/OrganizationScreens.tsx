/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  Plus, 
  Wallet, 
  CreditCard as CardIcon, 
  Calendar, 
  Check, 
  Info, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  PiggyBank, 
  DollarSign, 
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { BankAccount, CreditCard, Transaction } from '../../types';

interface OrganizationScreensProps {
  currentScreen: 'categorias' | 'contas' | 'cartoes';
  setScreen: (screen: any) => void;
  accounts: BankAccount[];
  cards: CreditCard[];
  transactions: Transaction[];
  onAddAccount: (acc: BankAccount) => void;
  onAddCard: (card: CreditCard) => void;
  onUpdateCardLimit: (id: string, limit: number) => void;
}

export function OrganizationScreens({
  currentScreen,
  setScreen,
  accounts,
  cards,
  transactions,
  onAddAccount,
  onAddCard,
  onUpdateCardLimit
}: OrganizationScreensProps) {
  // Local forms
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'CORRENTE' | 'POUPANCA' | 'CARTEIRA' | 'CAIXINHA'>('CORRENTE');
  const [accBank, setAccBank] = useState('Nubank');
  const [accBalance, setAccBalance] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardColor, setCardColor] = useState('from-indigo-600 to-purple-800');

  // Interactive slider state for active credit card
  const [selectedCardLimitId, setSelectedCardLimitId] = useState<string>('crd_01');
  const activeSliderCard = cards.find(c => c.id === selectedCardLimitId) || cards[0];
  const [tempLimit, setTempLimit] = useState<number>(activeSliderCard?.limit || 10000);

  // Sync tempLimit when active card in slider changes
  React.useEffect(() => {
    if (activeSliderCard) {
      setTempLimit(activeSliderCard.limit);
    }
  }, [selectedCardLimitId, cards]);

  // CATEGORIES DEFINITION & METRICS (Sovereign Budget)
  const categoryBudgets = useMemo(() => {
    // Standard limits per category
    const budgets: Record<string, { limit: number; color: string; icon: string }> = {
      'Alimentação': { limit: 1200.00, color: 'bg-rose-500 text-rose-500', icon: '🍔' },
      'Transporte': { limit: 600.00, color: 'bg-teal-500 text-teal-500', icon: '🚗' },
      'Moradia': { limit: 3000.00, color: 'bg-indigo-500 text-indigo-500', icon: '🏠' },
      'Lazer': { limit: 800.00, color: 'bg-purple-500 text-purple-500', icon: '🍿' },
      'Saúde': { limit: 500.00, color: 'bg-emerald-500 text-emerald-500', icon: '💊' },
      'Assinaturas': { limit: 200.00, color: 'bg-amber-500 text-amber-500', icon: '💳' },
    };

    // Calculate current spending for active month
    const spendings: Record<string, number> = {};
    transactions.filter(t => t.type === 'DESPESA').forEach(t => {
      spendings[t.category] = (spendings[t.category] || 0) + t.amount;
    });

    return Object.entries(budgets).map(([cat, data]) => {
      const spent = spendings[cat] || 0;
      const progress = Math.min(Math.round((spent / data.limit) * 100), 100);
      return {
        name: cat,
        limit: data.limit,
        spent,
        progress,
        colorClass: data.color,
        icon: data.icon,
        isOverBudget: spent > data.limit
      };
    });
  }, [transactions]);

  // Handlers
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName || !accBalance) return;
    
    const newAcc: BankAccount = {
      id: `acc_${Math.random().toString(36).substring(2, 9)}`,
      name: accName,
      type: accType as any,
      bankName: accBank,
      balance: parseFloat(accBalance),
      createdAt: '2026-08-01'
    };
    onAddAccount(newAcc);
    setAccName('');
    setAccBalance('');
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardLimit || !cardBank) return;

    const newCard: CreditCard = {
      id: `crd_${Math.random().toString(36).substring(2, 9)}`,
      name: cardName,
      bankName: cardBank,
      limit: parseFloat(cardLimit),
      usedLimit: 0,
      availableLimit: parseFloat(cardLimit),
      invoiceClosingDay: 25,
      invoiceDueDay: 5,
      bestPurchaseDay: 26,
      color: cardColor
    };
    onAddCard(newCard);
    setCardName('');
    setCardLimit('');
    setCardBank('');
  };

  const handleSaveLimitSlider = () => {
    if (activeSliderCard) {
      onUpdateCardLimit(activeSliderCard.id, tempLimit);
    }
  };

  // 1. SCREEN CATEGORIAS
  if (currentScreen === 'categorias') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Controle de Limites por Categoria</h2>
            <p className="text-xs text-slate-400">Defina orçamentos mensais para evitar gastos impulsivos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List of active budgets progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-white font-display">Orçamentos de Limite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O Finanças Clean monitora de forma inteligente suas planilhas de lançamentos para avisar quando sua taxa de consumo de categoria estiver em perigo.
            </p>

            <div className="space-y-4 pt-2">
              {categoryBudgets.map(cat => (
                <div key={cat.name} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <span className="font-mono text-slate-400">
                      R$ {cat.spent.toFixed(2)} / <strong className="text-slate-300">R$ {cat.limit.toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Progressive Bar */}
                  <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cat.isOverBudget ? 'bg-rose-500' : cat.progress > 85 ? 'bg-amber-500' : 'bg-teal-500'}`}
                      style={{ width: `${cat.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Taxa de consumo: {cat.progress}%</span>
                    {cat.isOverBudget ? (
                      <span className="text-rose-400 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Orçamento estourado
                      </span>
                    ) : (
                      <span className="text-teal-400 font-semibold">Consumo saudável</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Simulator Advice (SOLID) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-400">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Por que definir metas?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estudos de educação financeira demonstram que usuários que definem limites explícitos de consumo conseguem economizar em média **22% a mais** nos primeiros 3 meses de utilização.
              </p>
              <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-xl flex gap-2.5 text-xs text-indigo-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Configuração Sincronizada:</strong> Suas categorias são cadastradas diretamente na aba <code>Categorias</code> da sua planilha pessoal. Mudanças na planilha atualizam os limites automaticamente.
                </span>
              </div>
            </div>

            <button
              onClick={() => setScreen('novo_lancamento')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors text-center"
            >
              Planejar Novo Lançamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCREEN CONTAS BANCÁRIAS
  if (currentScreen === 'contas') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Contas Bancárias Ativas</h2>
          <p className="text-xs text-slate-400">Controle de saldos físicos integrados de forma soberana</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick list of Accounts (Left column 2/3 wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <h3 className="font-bold text-sm text-white font-display">Portfólio de Contas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white">{acc.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{acc.type}</p>
                      </div>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                        {acc.bankName}
                      </span>
                    </div>

                    <div>
                      <p className="text-[9px] text-slate-500 font-mono">Saldo Disponível</p>
                      <h4 className="text-xl font-black font-display text-white mt-0.5">
                        R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Account Form Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm h-max">
            <h3 className="font-bold text-sm text-white font-display mb-3">Vincular Nova Conta</h3>
            <form onSubmit={handleAddAccountSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Identificação da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Itaú Personalité"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Instituição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Itaú"
                    value={accBank}
                    onChange={(e) => setAccBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Tipo de Conta</label>
                  <select
                    value={accType}
                    onChange={(e: any) => setAccType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  >
                    <option value="CORRENTE">C. Corrente</option>
                    <option value="POUPANCA">Poupança</option>
                    <option value="CARTEIRA">Dinheiro</option>
                    <option value="CAIXINHA">Invest. / Reserva</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={accBalance}
                  onChange={(e) => setAccBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none font-mono font-bold text-teal-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Conta
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. SCREEN CARTÕES
  if (currentScreen === 'cartoes') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Portfólio de Cartões de Crédito</h2>
          <p className="text-xs text-slate-400">Simule seu limite dinâmico e organize faturas mensais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deck of Credit Cards */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-sm text-white font-display">Seus Cartões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map(c => (
                <div key={c.id} className={`p-5 rounded-2xl bg-gradient-to-tr ${c.color} text-white space-y-4 relative overflow-hidden shadow-lg border border-white/5`}>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-[10px] opacity-75 font-semibold uppercase tracking-wider">{c.name}</p>
                      <h4 className="text-base font-black font-display tracking-tight">{c.bankName}</h4>
                    </div>
                    <CardIcon className="w-5 h-5 opacity-80" />
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className="text-[9px] opacity-70">Limite Consumido</p>
                    <h5 className="text-lg font-black font-display">
                      R$ {c.usedLimit.toLocaleString('pt-BR')} / <span className="opacity-80">R$ {c.limit.toLocaleString('pt-BR')}</span>
                    </h5>
                  </div>

                  {/* Limit bar */}
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden relative z-10">
                    <div 
                      className="bg-white h-full rounded-full" 
                      style={{ width: `${(c.usedLimit / c.limit) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] opacity-75 relative z-10 font-mono">
                    <span>Melhor compra: Dia {c.bestPurchaseDay}</span>
                    <span>Vencimento: Dia {c.invoiceDueDay}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations engine */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex gap-3 items-start">
              <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Recomendador Inteligente de Melhor Cartão</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Baseado no dia do mês atual (<strong>01 de Agosto</strong>), o melhor cartão para compras hoje é o <strong>Inter Black</strong>, com fechamento de fatura previsto em 9 dias, estendendo seu prazo de pagamento para 40 dias!
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Limit Slider Control Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-white font-display">Ajustar Limite Dinâmico</h3>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Selecione o Cartão</label>
              <select
                value={selectedCardLimitId}
                onChange={(e) => setSelectedCardLimitId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (R$ {c.limit.toLocaleString('pt-BR')})</option>
                ))}
              </select>
            </div>

            {/* Slider visual element */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Novo Limite Alvo:</span>
                <span className="text-white font-bold font-mono">R$ {tempLimit.toLocaleString('pt-BR')}</span>
              </div>
              <input 
                type="range" 
                min="2000" 
                max="30000" 
                step="500"
                value={tempLimit} 
                onChange={(e) => setTempLimit(parseFloat(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Min: R$ 2.000</span>
                <span>Max: R$ 30.000</span>
              </div>
            </div>

            <button
              onClick={handleSaveLimitSlider}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> Atualizar Limite no Sheets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
