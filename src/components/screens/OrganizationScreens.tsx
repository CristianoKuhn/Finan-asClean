/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
  Edit2,
  X,
  Save,
  Trash2,
  Lock,
  Target,
  Banknote,
  ShieldCheck
} from 'lucide-react';
import { BankAccount, CreditCard, Transaction } from '../../types';

interface OrganizationScreensProps {
  currentScreen: 'categorias' | 'contas' | 'cartoes';
  setScreen: (screen: any) => void;
  accounts: BankAccount[];
  cards: CreditCard[];
  transactions: Transaction[];
  onAddAccount: (acc: BankAccount) => void;
  onUpdateAccount?: (id: string, fields: Partial<BankAccount>) => void;
  onDeleteAccount?: (id: string) => void;
  onAddCard: (card: CreditCard) => void;
  onUpdateCard?: (id: string, fields: Partial<CreditCard>) => void;
  onDeleteCard?: (id: string) => void;
  onUpdateCardLimit: (id: string, limit: number) => void;
}

export function OrganizationScreens({
  currentScreen,
  setScreen,
  accounts,
  cards,
  transactions,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateCardLimit
}: OrganizationScreensProps) {
  // Local forms for new account & card
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'CORRENTE' | 'POUPANCA' | 'CARTEIRA' | 'CAIXINHA'>('CORRENTE');
  const [accBank, setAccBank] = useState('Nubank');
  const [accBalance, setAccBalance] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardDueDay, setCardDueDay] = useState('10');
  const [cardClosingDay, setCardClosingDay] = useState('03');
  const [cardColor, setCardColor] = useState('from-indigo-600 to-purple-800');

  // Modal / Inline Editing for Accounts
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editAccName, setEditAccName] = useState('');
  const [editAccBank, setEditAccBank] = useState('');
  const [editAccType, setEditAccType] = useState<string>('CORRENTE');
  const [editAccBalance, setEditAccBalance] = useState('');

  // Modal / Inline Editing for Credit Cards
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardName, setEditCardName] = useState('');
  const [editCardBank, setEditCardBank] = useState('');
  const [editCardLimit, setEditCardLimit] = useState('');
  const [editCardDueDay, setEditCardDueDay] = useState('');
  const [editCardClosingDay, setEditCardClosingDay] = useState('');

  // Standalone Vaults (Cofre / Reservas guardadas sem ser banco necessariamente)
  const [vaultItems, setVaultItems] = useState<{ id: string; name: string; amount: number; note: string }[]>(() => {
    const cached = localStorage.getItem('financas_pro_vault_items');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: 'v_01', name: 'Cofre Físico em Casa (Espécie)', amount: 2500.00, note: 'Reserva física em notas' },
      { id: 'v_02', name: 'Reserva de Emergência no Cofre', amount: 5000.00, note: 'Proteção contra imprevistos' }
    ];
  });

  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultAmount, setNewVaultAmount] = useState('');
  const [newVaultNote, setNewVaultNote] = useState('');

  useEffect(() => {
    localStorage.setItem('financas_pro_vault_items', JSON.stringify(vaultItems));
  }, [vaultItems]);

  const handleAddVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName || !newVaultAmount) return;
    const item = {
      id: `v_${Math.random().toString(36).substring(2, 9)}`,
      name: newVaultName,
      amount: parseFloat(newVaultAmount),
      note: newVaultNote || 'Reserva no Cofre'
    };
    setVaultItems(prev => [...prev, item]);
    setNewVaultName('');
    setNewVaultAmount('');
    setNewVaultNote('');
  };

  const handleDeleteVault = (id: string) => {
    setVaultItems(prev => prev.filter(v => v.id !== id));
  };

  // User Monthly Average Salary & Year-End Vault Planning State
  const [monthlySalary, setMonthlySalary] = useState<number>(() => {
    const cached = localStorage.getItem('financas_pro_monthly_salary');
    return cached ? parseFloat(cached) : 6500;
  });

  const [yearEndVaultGoal, setYearEndVaultGoal] = useState<number>(() => {
    const cached = localStorage.getItem('financas_pro_vault_year_goal');
    return cached ? parseFloat(cached) : 15000;
  });

  const [salaryPlanningSaved, setSalaryPlanningSaved] = useState(false);

  const saveSalaryPlanning = (salaryVal: number, goalVal: number) => {
    setMonthlySalary(salaryVal);
    setYearEndVaultGoal(goalVal);
    localStorage.setItem('financas_pro_monthly_salary', salaryVal.toString());
    localStorage.setItem('financas_pro_vault_year_goal', goalVal.toString());
    setSalaryPlanningSaved(true);
    setTimeout(() => setSalaryPlanningSaved(false), 3000);
  };

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

  // Category limits state with localStorage persistence
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('financas_clean_category_limits');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {}
    }
    return {
      'Alimentação': 1200.00,
      'Transporte': 600.00,
      'Moradia': 3000.00,
      'Lazer': 800.00,
      'Saúde': 500.00,
      'Assinaturas': 200.00,
      'Educação': 1000.00,
      'Outros': 500.00
    };
  });

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState<string>('');
  
  // Right side panel state for adjusting limits
  const [selectedCatForForm, setSelectedCatForForm] = useState<string>('Alimentação');
  const [formLimitValue, setFormLimitValue] = useState<string>('1200');
  const [customCatInput, setCustomCatInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  const saveCategoryLimit = (catName: string, newLimitNum: number) => {
    if (!catName || isNaN(newLimitNum) || newLimitNum < 0) return;
    setCategoryLimits(prev => {
      const updated = { ...prev, [catName.trim()]: newLimitNum };
      localStorage.setItem('financas_clean_category_limits', JSON.stringify(updated));
      return updated;
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // CATEGORIES DEFINITION & METRICS (Sovereign Budget)
  const categoryBudgets = useMemo(() => {
    const categoryIcons: Record<string, string> = {
      'Alimentação': '🍔',
      'Transporte': '🚗',
      'Moradia': '🏠',
      'Lazer': '🍿',
      'Saúde': '💊',
      'Assinaturas': '💳',
      'Educação': '🎓',
      'Outros': '📦'
    };

    // Calculate current spending for active month
    const spendings: Record<string, number> = {};
    transactions.filter(t => t.type === 'DESPESA').forEach(t => {
      const cat = t.category || 'Outros';
      spendings[cat] = (spendings[cat] || 0) + t.amount;
    });

    const allCategories = Array.from(new Set([...Object.keys(categoryLimits), ...Object.keys(spendings)]));

    return allCategories.map(cat => {
      const limit = categoryLimits[cat] ?? 1000.00;
      const spent = spendings[cat] || 0;
      const rawProgress = limit > 0 ? (spent / limit) * 100 : 0;
      const progress = Math.min(Math.round(rawProgress), 100);
      const icon = categoryIcons[cat] || '🏷️';
      return {
        name: cat,
        limit,
        spent,
        progress,
        rawProgress,
        icon,
        isOverBudget: spent > limit
      };
    });
  }, [categoryLimits, transactions]);

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

    const due = parseInt(cardDueDay) || 10;
    const closing = parseInt(cardClosingDay) || 3;

    const newCard: CreditCard = {
      id: `crd_${Math.random().toString(36).substring(2, 9)}`,
      name: cardName,
      bankName: cardBank,
      limit: parseFloat(cardLimit),
      usedLimit: 0,
      availableLimit: parseFloat(cardLimit),
      invoiceClosingDay: closing,
      invoiceDueDay: due,
      bestPurchaseDay: closing + 1 > 31 ? 1 : closing + 1,
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
            <p className="text-xs text-slate-400">Defina e edite os orçamentos teto mensais para manter suas finanças em dia</p>
          </div>
          {saveSuccessMsg && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Limite atualizado com sucesso!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of active budgets progress (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white font-display">Orçamentos & Consumo por Categoria</h3>
              <span className="text-[11px] text-slate-400">Clique em <Edit2 className="w-3 h-3 inline text-teal-400 mx-0.5" /> para editar</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitore seu consumo mensal comparado ao limite máximo configurado para cada tipo de gasto.
            </p>

            <div className="space-y-3 pt-2">
              {categoryBudgets.map(cat => {
                const isEditingThis = editingCategory === cat.name;

                return (
                  <div key={cat.name} className="p-3.5 bg-slate-950/50 border border-slate-850 hover:border-slate-800 rounded-xl space-y-2.5 transition-all">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span> {cat.name}
                      </span>

                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-mono">R$</span>
                          <input 
                            type="number"
                            step="50"
                            className="w-24 bg-slate-900 border border-teal-500 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"
                            value={editingLimitValue}
                            onChange={(e) => setEditingLimitValue(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              saveCategoryLimit(cat.name, parseFloat(editingLimitValue));
                              setEditingCategory(null);
                            }}
                            className="p-1 bg-teal-600 hover:bg-teal-500 text-white rounded cursor-pointer transition-colors"
                            title="Salvar Limite"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">
                            R$ {cat.spent.toFixed(2)} / <strong className="text-slate-200 font-bold">R$ {cat.limit.toFixed(2)}</strong>
                          </span>
                          <button
                            onClick={() => {
                              setEditingCategory(cat.name);
                              setEditingLimitValue(cat.limit.toString());
                            }}
                            className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
                            title="Editar limite desta categoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progressive Bar */}
                    <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${cat.isOverBudget ? 'bg-rose-500' : cat.progress > 85 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${cat.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans">
                      <span>Taxa de consumo: <strong className="font-mono text-slate-300">{cat.progress}%</strong></span>
                      {cat.isOverBudget ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Excedeu teto de R$ {(cat.spent - cat.limit).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-teal-400 font-semibold">
                          R$ {(cat.limit - cat.spent).toFixed(2)} disponível
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Adjust Limit Form & Information (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-950/60 border border-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Ajustar Teto de Categoria</h3>
                  <p className="text-[11px] text-slate-400">Edite ou adicione um limite personalizado</p>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetCat = customCatInput.trim() || selectedCatForForm;
                  const limitVal = parseFloat(formLimitValue);
                  if (targetCat && !isNaN(limitVal)) {
                    saveCategoryLimit(targetCat, limitVal);
                    setCustomCatInput('');
                  }
                }}
                className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl"
              >
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Selecionar Categoria</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={selectedCatForForm}
                    onChange={(e) => {
                      setSelectedCatForForm(e.target.value);
                      const existing = categoryBudgets.find(b => b.name === e.target.value);
                      if (existing) setFormLimitValue(existing.limit.toString());
                    }}
                  >
                    {categoryBudgets.map(b => (
                      <option key={b.name} value={b.name}>{b.icon} {b.name} (Atual: R$ {b.limit})</option>
                    ))}
                    <option value="NOVA_CATEGORIA">+ Criar Nova Categoria Customizada</option>
                  </select>
                </div>

                {selectedCatForForm === 'NOVA_CATEGORIA' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Nome da Nova Categoria</label>
                    <input
                      type="text"
                      placeholder="Ex: Pets, Viagens, Estudos..."
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      value={customCatInput}
                      onChange={(e) => setCustomCatInput(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Novo Teto Mensal (R$)</label>
                  <input
                    type="number"
                    step="50"
                    placeholder="Ex: 1500"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formLimitValue}
                    onChange={(e) => setFormLimitValue(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Teto Orçamentário
                </button>
              </form>

              <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex gap-2.5 text-xs text-indigo-300 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <span>
                  <strong>Dica de Planejamento:</strong> Limites salvos são sincronizados com seu navegador e refletem automaticamente no simulador financeiro e nos alertas do AI Coach.
                </span>
              </div>
            </div>

            <button
              onClick={() => setScreen('novo_lancamento')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-lg text-xs cursor-pointer transition-colors text-center border border-slate-700"
            >
              + Planejar Novo Lançamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCREEN CONTAS BANCÁRIAS & COFRE
  if (currentScreen === 'contas') {
    // Aggregates for Contas & Cofre
    const carteiraAcc = accounts.find(a => a.type === 'CARTEIRA');
    const totalCarteira = carteiraAcc ? carteiraAcc.balance : 0;
    const totalBancos = accounts.filter(a => a.type !== 'CARTEIRA' && a.type !== 'CAIXINHA').reduce((acc, a) => acc + a.balance, 0);
    const totalCofres = vaultItems.reduce((acc, v) => acc + v.amount, 0);
    const totalConsolidado = totalCarteira + totalBancos + totalCofres;

    // Year-end vault planning math (5 months left: Aug, Sep, Oct, Nov, Dec 2026)
    const monthsRemainingInYear = 5;
    const gapToVaultGoal = Math.max(0, yearEndVaultGoal - totalCofres);
    const requiredMonthlyVaultSave = gapToVaultGoal / monthsRemainingInYear;
    const totalCategoryLimitsSum = (Object.values(categoryLimits) as number[]).reduce<number>((acc, l) => acc + (l || 0), 0);
    const estimatedMonthlyMargin: number = monthlySalary - totalCategoryLimitsSum;
    const isGoalFeasible = estimatedMonthlyMargin >= requiredMonthlyVaultSave;

    return (
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Wallet className="w-5 h-5 text-teal-400" />
              Gestão de Contas, Carteira & Cofre
            </h2>
            <p className="text-xs text-slate-400">Controle completo dos seus bancos, dinheiro físico em mãos, cofre de emergência e planejamento salarial</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-right">
              <p className="text-[9px] uppercase font-bold text-slate-500 font-mono">Consolidado Total</p>
              <p className="text-sm font-black text-teal-400 font-mono">
                R$ {totalConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: CARTEIRA (Dinheiro Físico em Mãos) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-950/60 border border-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Carteira (Dinheiro Físico em Mãos)</h3>
                <p className="text-[11px] text-slate-400">Informe exatamente quanto dinheiro vivo você tem com você agora</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Saldo em Carteira</p>
              <p className="text-lg font-black text-emerald-400">
                R$ {totalCarteira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Quick wallet balance editor */}
          <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              <span>Mantenha sua carteira atualizada para bater com seus saques ou pequenos pagamentos no dinheiro.</span>
            </div>
            <button
              onClick={() => {
                const newBal = prompt('Informe o valor atual em dinheiro físico na sua carteira (R$):', totalCarteira.toString());
                if (newBal !== null && !isNaN(parseFloat(newBal))) {
                  const num = parseFloat(newBal);
                  if (carteiraAcc) {
                    onUpdateAccount?.(carteiraAcc.id, { balance: num });
                  } else {
                    onAddAccount({
                      id: `acc_carteira_${Date.now()}`,
                      name: 'Carteira (Dinheiro)',
                      bankName: 'Espécie',
                      type: 'CARTEIRA',
                      balance: num,
                      createdAt: new Date().toISOString()
                    });
                  }
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Atualizar Carteira
            </button>
          </div>
        </div>

        {/* SECTION 2: BANCOS & CONTAS (Cadastrar, Editar, Retirar Bancos) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white font-display">Bancos & Contas Vinculadas</h3>
                <p className="text-xs text-slate-400">Cadastre, edite ou remova seus bancos e acompanhe os saldos</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Total Bancos: <strong className="text-teal-400">R$ {totalBancos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {accounts.filter(a => a.type !== 'CARTEIRA').map(acc => {
                const isEditingThisAcc = editingAccId === acc.id;

                if (isEditingThisAcc) {
                  return (
                    <div key={acc.id} className="p-4 bg-slate-950 border border-teal-500/80 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-teal-400">Editar Conta: {acc.name}</p>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nome da Conta"
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded"
                          value={editAccName}
                          onChange={(e) => setEditAccName(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nome do Banco"
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded"
                            value={editAccBank}
                            onChange={(e) => setEditAccBank(e.target.value)}
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Saldo R$"
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded"
                            value={editAccBalance}
                            onChange={(e) => setEditAccBalance(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingAccId(null)}
                          className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateAccount) {
                              onUpdateAccount(acc.id, {
                                name: editAccName || acc.name,
                                bankName: editAccBank || acc.bankName,
                                balance: parseFloat(editAccBalance) || acc.balance
                              });
                            }
                            setEditingAccId(null);
                          }}
                          className="px-2.5 py-1 bg-teal-600 text-white font-bold text-xs rounded hover:bg-teal-500"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={acc.id} className="p-4 bg-slate-950/50 border border-slate-850 hover:border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between h-36 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{acc.type}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                          {acc.bankName}
                        </span>
                        <button
                          onClick={() => {
                            setEditingAccId(acc.id);
                            setEditAccName(acc.name);
                            setEditAccBank(acc.bankName);
                            setEditAccType(acc.type);
                            setEditAccBalance(acc.balance.toString());
                          }}
                          className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                          title="Editar Conta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteAccount && (
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja retirar/excluir a conta ${acc.name}?`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                            title="Retirar/Excluir Banco"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-slate-500 font-mono">Saldo em Banco</p>
                        <h4 className="text-xl font-black font-display text-white mt-0.5">
                          R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form: Add New Bank */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" /> Cadastrar Novo Banco / Conta
            </h3>

            <form onSubmit={handleAddAccountSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nome da Conta / Identificação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Itaú Personalité, Nubank Conta"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Instituição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Itaú, Bradesco"
                    value={accBank}
                    onChange={(e) => setAccBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tipo de Conta</label>
                  <select
                    value={accType}
                    onChange={(e: any) => setAccType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  >
                    <option value="CORRENTE">C. Corrente</option>
                    <option value="POUPANCA">Poupança</option>
                    <option value="DIGITAL">Conta Digital</option>
                    <option value="CAIXINHA">Investimento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Saldo Atual (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={accBalance}
                  onChange={(e) => setAccBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs font-mono font-bold text-teal-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Cadastrar Banco
              </button>
            </form>
          </div>
        </div>

        {/* SECTION 3: COFRE (Valores Guardados em Cofre / Reserva Físicos ou Caixinhas) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-950/60 border border-purple-900/50 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Cofres & Caixinhas de Reserva</h3>
                <p className="text-[11px] text-slate-400">Cadastre valores guardados em cofre físico ou reservas (sem necessidade de associar a um banco)</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total em Cofres</p>
              <p className="text-lg font-black text-purple-400">
                R$ {totalCofres.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of Vault items (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {vaultItems.map(item => (
                <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-850 hover:border-slate-800 rounded-xl flex justify-between items-center transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-purple-400" /> {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">{item.note}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-purple-300">
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleDeleteVault(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Excluir item do cofre"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form: Add Vault Item (5 cols) */}
            <form onSubmit={handleAddVault} className="lg:col-span-5 bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-3">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-purple-400" /> Adicionar Guardado em Cofre
              </p>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nome da Reserva / Cofre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cofre Físico no Quarto, Caixinha Objetivos"
                  value={newVaultName}
                  onChange={(e) => setNewVaultName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Valor Guardado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 3000"
                    value={newVaultAmount}
                    onChange={(e) => setNewVaultAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white font-mono rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nota / Observação</label>
                  <input
                    type="text"
                    placeholder="Ex: Notas de 100"
                    value={newVaultNote}
                    onChange={(e) => setNewVaultNote(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Salvar no Cofre
              </button>
            </form>
          </div>
        </div>

        {/* SECTION 4: SALÁRIO MENSAL MÉDIO & PLANEJAMENTO PARA O FIM DO ANO (META NO COFRE ATÉ DEZEMBRO) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-950/60 border border-teal-900/50 rounded-xl flex items-center justify-center text-teal-400 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Planejamento Salarial & Meta de Cofre (Fim do Ano)</h3>
                <p className="text-xs text-slate-400">Projeção matemática soberana baseada na sua renda média e tetos orçamentários</p>
              </div>
            </div>

            {salaryPlanningSaved && (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-xl text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Planejamento atualizado com sucesso!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Inputs (5 cols) */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                saveSalaryPlanning(monthlySalary, yearEndVaultGoal);
              }}
              className="lg:col-span-5 bg-slate-950/50 p-5 border border-slate-850 rounded-xl space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Salário Mensal Médio (R$)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="Ex: 6500"
                  className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-teal-500 focus:outline-none font-bold"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(parseFloat(e.target.value) || 0)}
                />
                <p className="text-[10px] text-slate-500 mt-1">Sua renda líquida média mensal estimada</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Desejada no Cofre (Até Dez/2026) (R$)</label>
                <input
                  type="number"
                  step="500"
                  required
                  placeholder="Ex: 20000"
                  className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:outline-none font-bold text-purple-300"
                  value={yearEndVaultGoal}
                  onChange={(e) => setYearEndVaultGoal(parseFloat(e.target.value) || 0)}
                />
                <p className="text-[10px] text-slate-500 mt-1">Quanto você quer ter acumulado no Cofre até o final deste ano</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" /> Recalcular Planejamento
              </button>
            </form>

            {/* Live Planning Analytics & Diagnostic (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/30 p-5 border border-slate-850 rounded-xl space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-slate-500 font-mono">Saldo Atual no Cofre</p>
                  <p className="text-base font-black text-purple-400 font-mono mt-0.5">
                    R$ {totalCofres.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-slate-500 font-mono">Falta para a Meta</p>
                  <p className="text-base font-black text-amber-400 font-mono mt-0.5">
                    R$ {gapToVaultGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg col-span-2 md:col-span-1">
                  <p className="text-[9px] uppercase font-bold text-slate-500 font-mono">Aporte Mensal Necessário</p>
                  <p className="text-base font-black text-teal-400 font-mono mt-0.5">
                    R$ {requiredMonthlyVaultSave.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span className="text-[10px] text-slate-500 font-sans">/mês</span>
                  </p>
                </div>
              </div>

              {/* Progress bar to year end goal */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400">Progresso da Meta no Cofre (Dez/2026):</span>
                  <span className="text-white font-bold font-mono">
                    {yearEndVaultGoal > 0 ? Math.min(100, Math.round((totalCofres / yearEndVaultGoal) * 100)) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-850 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${yearEndVaultGoal > 0 ? Math.min(100, (totalCofres / yearEndVaultGoal) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Architect Diagnostic Box */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${isGoalFeasible ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'}`}>
                {isGoalFeasible ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold">
                    {isGoalFeasible ? '✅ Planejamento Totalmente Viável!' : '⚠️ Atenção no Planejamento do Cofre:'}
                  </p>
                  <p className="text-[11px] opacity-90">
                    Com seu salário médio de <strong>R$ {Number(monthlySalary).toLocaleString('pt-BR')}</strong> e teto de gastos de <strong>R$ {Number(totalCategoryLimitsSum).toLocaleString('pt-BR')}</strong>, sua margem estimada é de <strong>R$ {Number(estimatedMonthlyMargin).toLocaleString('pt-BR')}/mês</strong>.
                  </p>
                  <p className="text-[11px] opacity-90">
                    {isGoalFeasible ? (
                      `Guardando R$ ${requiredMonthlyVaultSave.toFixed(2)} por mês nos próximos ${monthsRemainingInYear} meses, você atingirá com segurança a meta de R$ ${yearEndVaultGoal.toLocaleString('pt-BR')} no Cofre até o fim do ano.`
                    ) : (
                      `Você precisará de R$ ${requiredMonthlyVaultSave.toFixed(2)}/mês para o cofre. Recomendamos reduzir R$ ${(requiredMonthlyVaultSave - estimatedMonthlyMargin).toFixed(2)} em seus limites de categoria.`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. SCREEN CARTÕES DE CRÉDITO & VENCIMENTO DE FATURAS
  if (currentScreen === 'cartoes') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Portfólio de Cartões de Crédito</h2>
          <p className="text-xs text-slate-400">Configure limites dinâmicos e cadastre as datas de vencimento e fechamento das faturas de cada banco</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deck of Credit Cards (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-sm text-white font-display">Seus Cartões Ativos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map(c => {
                const isEditingThisCard = editingCardId === c.id;

                if (isEditingThisCard) {
                  return (
                    <div key={c.id} className="p-5 rounded-2xl bg-slate-950 border border-teal-500 space-y-3">
                      <p className="text-xs font-bold text-teal-400">Editar Cartão: {c.name}</p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nome do Cartão"
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded"
                          value={editCardName}
                          onChange={(e) => setEditCardName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Instituição / Banco"
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded"
                          value={editCardBank}
                          onChange={(e) => setEditCardBank(e.target.value)}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 uppercase">Limite R$</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded"
                              value={editCardLimit}
                              onChange={(e) => setEditCardLimit(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 uppercase">Vencimento</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded"
                              value={editCardDueDay}
                              onChange={(e) => setEditCardDueDay(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 uppercase">Fechamento</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded"
                              value={editCardClosingDay}
                              onChange={(e) => setEditCardClosingDay(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingCardId(null)}
                          className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateCard) {
                              onUpdateCard(c.id, {
                                name: editCardName || c.name,
                                bankName: editCardBank || c.bankName,
                                limit: parseFloat(editCardLimit) || c.limit,
                                invoiceDueDay: parseInt(editCardDueDay) || c.invoiceDueDay,
                                invoiceClosingDay: parseInt(editCardClosingDay) || c.invoiceClosingDay
                              });
                            }
                            setEditingCardId(null);
                          }}
                          className="px-2.5 py-1 bg-teal-600 text-white font-bold text-xs rounded hover:bg-teal-500"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={c.id} className={`p-5 rounded-2xl bg-gradient-to-tr ${c.color} text-white space-y-4 relative overflow-hidden shadow-lg border border-white/10 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-[10px] opacity-80 font-semibold uppercase tracking-wider">{c.name}</p>
                        <h4 className="text-base font-black font-display tracking-tight">{c.bankName}</h4>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg backdrop-blur-xs">
                        <button
                          onClick={() => {
                            setEditingCardId(c.id);
                            setEditCardName(c.name);
                            setEditCardBank(c.bankName);
                            setEditCardLimit(c.limit.toString());
                            setEditCardDueDay(c.invoiceDueDay.toString());
                            setEditCardClosingDay(c.invoiceClosingDay.toString());
                          }}
                          className="p-1 hover:bg-white/20 rounded cursor-pointer transition-colors"
                          title="Editar Cartão e Vencimento"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-white" />
                        </button>
                        {onDeleteCard && (
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente remover o cartão ${c.name}?`)) {
                                onDeleteCard(c.id);
                              }
                            }}
                            className="p-1 hover:bg-rose-500/30 text-rose-200 rounded cursor-pointer transition-colors"
                            title="Remover Cartão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <p className="text-[9px] opacity-75">Fatura / Limite Consumido</p>
                      <h5 className="text-lg font-black font-display">
                        R$ {c.usedLimit.toLocaleString('pt-BR')} / <span className="opacity-80">R$ {c.limit.toLocaleString('pt-BR')}</span>
                      </h5>
                    </div>

                    {/* Limit bar */}
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden relative z-10">
                      <div 
                        className="bg-white h-full rounded-full" 
                        style={{ width: `${Math.min(100, (c.usedLimit / c.limit) * 100)}%` }}
                      ></div>
                    </div>

                    <div className="p-2.5 bg-black/30 rounded-xl space-y-1 relative z-10 font-mono text-[11px]">
                      <div className="flex justify-between items-center text-emerald-300 font-bold">
                        <span>📅 Vencimento Fatura:</span>
                        <span>Dia {c.invoiceDueDay}</span>
                      </div>
                      <div className="flex justify-between items-center opacity-80 text-[10px]">
                        <span>Fechamento Fatura:</span>
                        <span>Dia {c.invoiceClosingDay}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations engine */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex gap-3 items-start">
              <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Auditor Inteligente de Cartões & Datas de Fatura</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cadastrar o dia exato de fechamento e vencimento de cada fatura garante que o Copiloto IA avise quando uma fatura estiver próxima do vencimento, prevenindo juros e maximizando seu prazo de pagamento.
                </p>
              </div>
            </div>
          </div>

          {/* Form: Register New Credit Card (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" /> Cadastrar Novo Cartão
            </h3>

            <form onSubmit={handleAddCardSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank Ultravioleta, Itaú Click"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Instituição / Banco Emissor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank, Banco do Brasil"
                  value={cardBank}
                  onChange={(e) => setCardBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Limite do Cartão (R$)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="Ex: 8000"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs font-mono font-bold text-purple-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    placeholder="Ex: 10"
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dia do Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    placeholder="Ex: 03"
                    value={cardClosingDay}
                    onChange={(e) => setCardClosingDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Cadastrar Cartão
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
