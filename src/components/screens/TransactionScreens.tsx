/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Plus, 
  Calendar, 
  Tag, 
  Wallet, 
  CreditCard as CardIcon, 
  FileText, 
  Check, 
  X, 
  Filter, 
  ChevronDown, 
  TrendingUp, 
  Trash2, 
  AlertCircle, 
  Upload, 
  Edit,
  DollarSign,
  Star,
  Copy,
  Clock,
  MapPin,
  User as UserIcon,
  ArrowLeftRight
} from 'lucide-react';
import { Transaction, BankAccount, CreditCard } from '../../types';

// Helper to calculate date by adding months to an existing YYYY-MM-DD string
function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const parts = dateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  month += monthsToAdd;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  
  const yearStr = year.toString();
  const monthStr = month < 10 ? `0${month}` : month.toString();
  
  // Clamp day bounds (e.g. Feb 31 -> Feb 28/29)
  let targetDay = day;
  const maxDaysInMonth = new Date(year, month, 0).getDate();
  if (targetDay > maxDaysInMonth) {
    targetDay = maxDaysInMonth;
  }
  const dayStr = targetDay < 10 ? `0${targetDay}` : targetDay.toString();
  
  return `${yearStr}-${monthStr}-${dayStr}`;
}

interface TransactionScreensProps {
  currentScreen: 'receitas' | 'despesas' | 'novo_lancamento' | 'editar_lancamento';
  setScreen: (screen: any) => void;
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onAddTransaction: (txn: Transaction) => void;
  onEditTransaction: (txn: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  editingTransactionId?: string;
  setEditingTransactionId: (id: string | undefined) => void;
}

export function TransactionScreens({
  currentScreen,
  setScreen,
  transactions,
  accounts,
  cards,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  editingTransactionId,
  setEditingTransactionId
}: TransactionScreensProps) {
  // Local states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form states (shared for New / Edit)
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'RECEITA' | 'DESPESA' | 'INVESTIMENTO' | 'TRANSFERENCIA'>('DESPESA');
  const [category, setCategory] = useState('Alimentação');
  const [subcategory, setSubcategory] = useState('Geral');
  const [accountId, setAccountId] = useState('acc_01');
  const [toAccountId, setToAccountId] = useState('acc_02');
  const [cardId, setCardId] = useState('crd_01');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TED'>('PIX');
  const [date, setDate] = useState('2026-08-01');
  const [time, setTime] = useState('12:00');
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [relatedPerson, setRelatedPerson] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [recurrent, setRecurrent] = useState(false);
  const [recurrentMonths, setRecurrentMonths] = useState('20');

  // Load transaction on editing screen
  const editingTxn = useMemo(() => {
    if (currentScreen === 'editar_lancamento' && editingTransactionId) {
      const found = transactions.find(t => t.id === editingTransactionId);
      if (found) {
        setDescription(found.description);
        setAmount(found.amount.toString());
        setType(found.type as any);
        setCategory(found.category);
        setSubcategory(found.subcategory || 'Geral');
        setAccountId(found.accountId || 'acc_01');
        setCardId(found.cardId || 'crd_01');
        setPaymentMethod(found.paymentMethod);
        setDate(found.date);
        setTime(found.time || '12:00');
        setNotes(found.notes || '');
        setAttachmentName(found.attachmentName);
        setTags(found.tags?.join(', ') || '');
        setLocation(found.location || '');
        setRelatedPerson(found.relatedPerson || '');
        setIsFavorite(found.isFavorite || false);
        setRecurrent(found.recurrent || false);
      }
      return found;
    }
    return undefined;
  }, [currentScreen, editingTransactionId, transactions]);

  // Filters and calculations for Receitas
  const incomes = useMemo(() => {
    return transactions.filter(t => t.type === 'RECEITA');
  }, [transactions]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [incomes, searchTerm, selectedCategoryFilter]);

  const incomeTotal = useMemo(() => {
    return incomes.reduce((acc, curr) => acc + curr.amount, 0);
  }, [incomes]);

  // Filters and calculations for Despesas
  const expenses = useMemo(() => {
    return transactions.filter(t => t.type === 'DESPESA');
  }, [transactions]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, selectedCategoryFilter]);

  const expenseTotal = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  // Helper functions for favoriting and duplicating
  const handleToggleFavorite = (txn: Transaction) => {
    onEditTransaction({
      ...txn,
      isFavorite: !txn.isFavorite
    });
  };

  const handleDuplicate = (txn: Transaction) => {
    const newId = `txn_${Math.random().toString(36).substring(2, 9)}`;
    onAddTransaction({
      ...txn,
      id: newId,
      description: `${txn.description} (Cópia)`,
      date: new Date().toISOString().substring(0, 10), // Copy as of today
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const valNumeric = parseFloat(amount);
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);

      if (currentScreen === 'novo_lancamento') {
        const totalInstallments = recurrent ? (parseInt(recurrentMonths, 10) || 1) : 1;

        if (totalInstallments > 1) {
          // Add transactions for the next N months
          for (let i = 0; i < totalInstallments; i++) {
            const installmentDate = addMonthsToDate(date, i);
            const installmentDesc = `${description} (${i + 1}/${totalInstallments})`;
            const instNotes = notes 
              ? `${notes} - Parcela ${i + 1} de ${totalInstallments}` 
              : `Lançamento recorrente de parcelas - ${i + 1} de ${totalInstallments}`;

            const newTxn: Transaction = {
              id: `txn_rec_${Math.random().toString(36).substring(2, 9)}_${i}`,
              description: installmentDesc,
              amount: valNumeric,
              type: type,
              category,
              subcategory: subcategory || 'Geral',
              accountId: paymentMethod === 'CREDITO' ? '' : accountId,
              cardId: paymentMethod === 'CREDITO' ? cardId : undefined,
              paymentMethod,
              date: installmentDate,
              time: time || '12:00',
              notes: instNotes,
              attachmentName,
              status: 'PAGO',
              tags: parsedTags,
              location: location || undefined,
              relatedPerson: relatedPerson || undefined,
              isFavorite,
              recurrent: true
            };
            onAddTransaction(newTxn);
          }
        } else {
          // Standard single transaction
          const newTxn: Transaction = {
            id: `txn_${Math.random().toString(36).substring(2, 9)}`,
            description,
            amount: valNumeric,
            type: type,
            category,
            subcategory: subcategory || 'Geral',
            accountId: paymentMethod === 'CREDITO' ? '' : accountId,
            cardId: paymentMethod === 'CREDITO' ? cardId : undefined,
            paymentMethod,
            date,
            time: time || '12:00',
            notes: notes || undefined,
            attachmentName,
            status: 'PAGO',
            tags: parsedTags,
            location: location || undefined,
            relatedPerson: relatedPerson || undefined,
            isFavorite,
            recurrent
          };
          onAddTransaction(newTxn);
        }
      } else if (currentScreen === 'editar_lancamento' && editingTransactionId) {
        const updatedTxn: Transaction = {
          id: editingTransactionId,
          description,
          amount: valNumeric,
          type: type,
          category,
          subcategory: subcategory || 'Geral',
          accountId: paymentMethod === 'CREDITO' ? '' : accountId,
          cardId: paymentMethod === 'CREDITO' ? cardId : undefined,
          paymentMethod,
          date,
          time: time || '12:00',
          notes: notes || undefined,
          attachmentName,
          status: 'PAGO',
          tags: parsedTags,
          location: location || undefined,
          relatedPerson: relatedPerson || undefined,
          isFavorite,
          recurrent
        };
        onEditTransaction(updatedTxn);
      }

      // Reset form
      setDescription('');
      setAmount('');
      setNotes('');
      setTags('');
      setLocation('');
      setRelatedPerson('');
      setIsFavorite(false);
      setRecurrent(false);
      setRecurrentMonths('20');
      setAttachmentName(undefined);
      setIsSubmitting(false);
      setEditingTransactionId(undefined);
      setScreen('dashboard');
    }, 1000);
  };

  const handleSimulateFile = () => {
    setAttachmentName(`nota_fiscal_simulada_${Math.floor(Math.random() * 9000 + 1000)}.pdf`);
  };

  // 1. RECEITAS SCREEN
  if (currentScreen === 'receitas') {
    return (
      <div className="space-y-6">
        {/* Banner KPI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <ArrowUpRight className="w-64 h-64 text-emerald-400" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Entradas Consolidadas</p>
              <h2 className="text-3xl font-black text-emerald-400 font-display mt-1">
                R$ {incomeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Total acumulado de receitas registradas no Sheets</p>
            </div>
            <button
              onClick={() => {
                setType('RECEITA');
                setPaymentMethod('TED');
                setCategory('Salário');
                setScreen('novo_lancamento');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:opacity-90 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Adicionar Receita
            </button>
          </div>
        </div>

        {/* Filters & Listing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-sm text-white font-display">Registros de Receitas</h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar receita..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
              >
                <option value="all">Todas Categorias</option>
                <option value="Salário">Salário</option>
                <option value="Investimentos">Rendimentos</option>
                <option value="Outros">Outras Entradas</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredIncomes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ArrowUpRight className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-xs font-bold">Nenhuma receita encontrada.</p>
                <p className="text-[10px]">Altere seus filtros ou adicione um novo aporte acima.</p>
              </div>
            ) : (
              filteredIncomes.map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between hover:bg-slate-850/30 px-2 rounded-lg transition-colors border-b border-slate-850/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded-xl relative">
                      <ArrowUpRight className="w-4 h-4" />
                      {t.recurrent && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-500 rounded-full border border-slate-900" title="Lançamento Recorrente" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white">{t.description}</p>
                        {t.isFavorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 mt-1">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium">{t.category} ({t.subcategory || 'Geral'})</span>
                        <span>•</span>
                        <span>{t.date.split('-').reverse().join('/')} {t.time && `às ${t.time}`}</span>
                        <span>•</span>
                        <span>{t.paymentMethod}</span>
                        {t.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-500"><MapPin className="w-3 h-3 text-teal-500" /> {t.location}</span>
                          </>
                        )}
                        {t.relatedPerson && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-500"><UserIcon className="w-3 h-3 text-purple-400" /> {t.relatedPerson}</span>
                          </>
                        )}
                      </div>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {t.tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded-md text-[8px] font-mono border border-slate-800 text-teal-400 flex items-center gap-0.5">
                              <Tag className="w-2 h-2 text-teal-500" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400 font-display">
                        + R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">Conta: {accounts.find(a => a.id === t.accountId)?.name || 'Outra'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFavorite(t)}
                        className={`p-1 hover:bg-slate-800 rounded transition-colors ${t.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                        title={t.isFavorite ? 'Remover dos favoritos' : 'Favoritar lançamento'}
                      >
                        <Star className={`w-3.5 h-3.5 ${t.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(t)}
                        className="p-1 hover:bg-slate-800 text-slate-500 hover:text-teal-400 rounded transition-colors"
                        title="Duplicar lançamento"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTransactionId(t.id);
                          setScreen('editar_lancamento');
                        }}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. DESPESAS SCREEN
  if (currentScreen === 'despesas') {
    return (
      <div className="space-y-6">
        {/* Banner KPI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <ArrowDownRight className="w-64 h-64 text-rose-400" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Despesas Consolidadas</p>
              <h2 className="text-3xl font-black text-rose-500 font-display mt-1">
                R$ {expenseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Total de débitos acumulados e lançados no cartão de crédito</p>
            </div>
            <button
              onClick={() => {
                setType('DESPESA');
                setPaymentMethod('PIX');
                setCategory('Alimentação');
                setScreen('novo_lancamento');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:opacity-90 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Adicionar Despesa
            </button>
          </div>
        </div>

        {/* Filters & Listing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-sm text-white font-display">Registros de Despesas</h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar despesa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
              >
                <option value="all">Todas Categorias</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Transporte">Transporte</option>
                <option value="Moradia">Moradia</option>
                <option value="Lazer">Lazer</option>
                <option value="Saúde">Saúde</option>
                <option value="Assinaturas">Assinaturas</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ArrowDownRight className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-xs font-bold">Nenhuma despesa encontrada.</p>
                <p className="text-[10px]">Altere seus filtros ou cadastre um novo lançamento acima.</p>
              </div>
            ) : (
              filteredExpenses.map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between hover:bg-slate-850/30 px-2 rounded-lg transition-colors border-b border-slate-850/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 rounded-xl relative">
                      <ArrowDownRight className="w-4 h-4" />
                      {t.recurrent && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-900" title="Lançamento Recorrente" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white">{t.description}</p>
                        {t.isFavorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 mt-1">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium">{t.category} ({t.subcategory || 'Geral'})</span>
                        <span>•</span>
                        <span>{t.date.split('-').reverse().join('/')} {t.time && `às ${t.time}`}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          {t.cardId ? <CardIcon className="w-3 h-3 text-purple-400" /> : <Wallet className="w-3 h-3 text-teal-400" />}
                          {t.cardId ? 'Crédito' : t.paymentMethod}
                        </span>
                        {t.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-500"><MapPin className="w-3 h-3 text-rose-400" /> {t.location}</span>
                          </>
                        )}
                        {t.relatedPerson && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-500"><UserIcon className="w-3 h-3 text-purple-400" /> {t.relatedPerson}</span>
                          </>
                        )}
                      </div>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {t.tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded-md text-[8px] font-mono border border-slate-800 text-rose-400 flex items-center gap-0.5">
                              <Tag className="w-2 h-2 text-rose-500" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white font-display">
                        - R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {t.cardId ? cards.find(c => c.id === t.cardId)?.name : accounts.find(a => a.id === t.accountId)?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFavorite(t)}
                        className={`p-1 hover:bg-slate-800 rounded transition-colors ${t.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                        title={t.isFavorite ? 'Remover dos favoritos' : 'Favoritar lançamento'}
                      >
                        <Star className={`w-3.5 h-3.5 ${t.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(t)}
                        className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Duplicar lançamento"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTransactionId(t.id);
                          setScreen('editar_lancamento');
                        }}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. NOVO LANÇAMENTO & 4. EDITAR LANÇAMENTO
  if (currentScreen === 'novo_lancamento' || currentScreen === 'editar_lancamento') {
    const isEdit = currentScreen === 'editar_lancamento';

    return (
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h3 className="font-bold text-base text-white font-display">
              {isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEdit ? 'Atualize as informações completas do lançamento' : 'Cadastre uma nova movimentação financeira detalhada'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTransactionId(undefined);
              setScreen('dashboard');
            }}
            className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Form Quick Switch buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => { setType('DESPESA'); setPaymentMethod('PIX'); setCategory('Alimentação'); }}
              className={`py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer transition-all border ${
                type === 'DESPESA' 
                  ? 'bg-rose-950/30 text-rose-400 border-rose-900/50 font-bold' 
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => { setType('RECEITA'); setPaymentMethod('TED'); setCategory('Salário'); }}
              className={`py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer transition-all border ${
                type === 'RECEITA' 
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50 font-bold' 
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => { setType('INVESTIMENTO'); setPaymentMethod('PIX'); setCategory('Investimentos'); }}
              className={`py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer transition-all border ${
                type === 'INVESTIMENTO' 
                  ? 'bg-purple-950/30 text-purple-400 border-purple-900/50 font-bold' 
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Aporte
            </button>
            <button
              type="button"
              onClick={() => { setType('TRANSFERENCIA'); setPaymentMethod('PIX'); setCategory('Transferência'); }}
              className={`py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer transition-all border ${
                type === 'TRANSFERENCIA' 
                  ? 'bg-blue-950/30 text-blue-400 border-blue-900/50 font-bold' 
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Transferência
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Descrição</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Almoço de negócios"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Valor (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs font-bold font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Categoria</label>
              {type === 'INVESTIMENTO' ? (
                <input
                  type="text"
                  disabled
                  value="Investimentos"
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-700 text-slate-500 rounded-lg text-xs focus:outline-none font-bold"
                />
              ) : type === 'TRANSFERENCIA' ? (
                <input
                  type="text"
                  disabled
                  value="Transferência"
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-700 text-slate-500 rounded-lg text-xs focus:outline-none font-bold"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                >
                  {type === 'DESPESA' ? (
                    <>
                      <option value="Alimentação">Alimentação</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Moradia">Moradia</option>
                      <option value="Lazer">Lazer</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Assinaturas">Assinaturas</option>
                      <option value="Casa">Casa</option>
                      <option value="Mercado">Mercado</option>
                      <option value="Educação">Educação</option>
                      <option value="Pets">Pets</option>
                      <option value="Viagem">Viagem</option>
                      <option value="Impostos">Impostos</option>
                    </>
                  ) : (
                    <>
                      <option value="Salário">Salário</option>
                      <option value="Investimentos">Rendimentos</option>
                      <option value="Outros">Outras Entradas</option>
                    </>
                  )}
                </select>
              )}
            </div>

            {/* Subcategory */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Subcategoria</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Ex: Supermercado, Apps, Gasolina"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Hora</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Transfer Specific: Source vs Destination Account */}
          {type === 'TRANSFERENCIA' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-1">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" /> Conta de Origem (Saída)
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} - Saldo: R$ {a.balance.toFixed(2)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-teal-400" /> Conta de Destino (Entrada)
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                >
                  {accounts.filter(a => a.id !== accountId).map(a => (
                    <option key={a.id} value={a.id}>{a.name} - Saldo: R$ {a.balance.toFixed(2)}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Non-transfer accounts: Payment Method and Account Selector */
            <>
              {/* Payment Method chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Forma de Pagamento</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 font-sans">
                  {(['PIX', 'TED', 'CREDITO', 'DEBITO', 'BOLETO', 'DINHEIRO'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold text-center cursor-pointer border transition-all ${
                        paymentMethod === method
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 font-medium'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Account vs Credit Card selection */}
              {paymentMethod === 'CREDITO' ? (
                <div className="space-y-1.5 animate-in slide-in-from-top-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Selecione o Cartão de Crédito</label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  >
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.bankName}) - Disp: R$ {c.availableLimit.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in slide-in-from-top-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Selecione a Conta Bancária de Débito</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} - Saldo: R$ {a.balance.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Advanced Location, Related Person, and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Local/Estabelecimento
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Posto Ipiranga, McDonald's"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" /> Pessoa Relacionada
              </label>
              <input
                type="text"
                value={relatedPerson}
                onChange={(e) => setRelatedPerson(e.target.value)}
                placeholder="Ex: Esposa, Sócio"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Tags (separar por vírgula)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: viagem, pessoal, urgente"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase">Observações (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Jantar de aniversário de casamento..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500 font-sans"
            ></textarea>
          </div>

          {/* Favorites & Recurrency inline row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="flex items-center justify-between p-3 bg-slate-950/30 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-1.5 rounded-lg border ${isFavorite ? 'bg-amber-950/40 border-amber-900/50 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
                </button>
                <div>
                  <p className="text-xs font-bold text-white">Favoritar Lançamento</p>
                  <p className="text-[10px] text-slate-500">Aparecerá com destaque na listagem rápida</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-3 p-3 bg-slate-950/30 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Lançamento Recorrente / Parcelado</p>
                    <p className="text-[10px] text-slate-500">Repetir e lançar nos próximos meses</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={recurrent}
                  onChange={(e) => setRecurrent(e.target.checked)}
                  className="w-4 h-4 accent-teal-500 cursor-pointer"
                />
              </div>
              
              {recurrent && (
                <div className="mt-1 pt-2 border-t border-slate-900/60 flex items-center justify-between gap-3 animate-in slide-in-from-top-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Duração (Meses a lançar)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={recurrentMonths}
                      onChange={(e) => setRecurrentMonths(e.target.value)}
                      className="w-20 px-2.5 py-1 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs font-black text-center focus:outline-none focus:border-teal-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">meses</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachment upload */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase">Anexar Comprovante (Drive)</label>
            <div className="border border-dashed border-slate-800 rounded-lg p-3 bg-slate-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-[10px] font-semibold text-white">
                    {attachmentName ? attachmentName : 'Nenhum comprovante anexado'}
                  </p>
                  <p className="text-[8px] text-slate-500">O comprovante será salvo no seu Google Drive</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSimulateFile}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-teal-400 hover:bg-slate-700 transition-all cursor-pointer"
              >
                {attachmentName ? 'Alterar' : 'Anexar PDF'}
              </button>
            </div>
          </div>

          {/* Form controls */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingTransactionId(undefined);
                setScreen('dashboard');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Salvar no Sheets'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}
