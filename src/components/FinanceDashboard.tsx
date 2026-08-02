/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  CreditCard as CardIcon, 
  TrendingUp, 
  Plus, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Utensils, 
  Car, 
  Briefcase, 
  Sliders, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  User,
  Settings,
  Database,
  Info,
  Bell,
  Search,
  Menu,
  ChevronDown,
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  Users,
  Smartphone,
  Grid,
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';

// Import our modular screens
import { AuthScreens } from './screens/AuthScreens';
import { TransactionScreens } from './screens/TransactionScreens';
import { OrganizationScreens } from './screens/OrganizationScreens';
import { PlanningScreens } from './screens/PlanningScreens';
import { AnalysisScreens } from './screens/AnalysisScreens';
import { SystemScreens } from './screens/SystemScreens';
import { SearchScreens } from './screens/SearchScreens';
import { AiCoachScreen } from './screens/AiCoachScreen';
import { SplitExpensesScreen } from './screens/SplitExpensesScreen';
import { UserManagementScreen, UserAccount, AVAILABLE_SCREENS } from './screens/UserManagementScreen';

import { Transaction, BankAccount, CreditCard, FinancialGoal, Subscription, Investment } from '../types';

interface FinanceDashboardProps {
  onLogApiCall?: (log: {
    endpoint: string;
    method: 'GET' | 'POST';
    payload?: string;
    response: string;
    technicalSteps: string[];
  }) => void;
}

interface PhoneWrapperProps {
  enabled: boolean;
  onDisable: () => void;
  children: React.ReactNode;
}

function PhoneEmulatorWrapper({ enabled, onDisable, children }: PhoneWrapperProps) {
  if (!enabled) {
    return <div className="space-y-6 w-full">{children}</div>;
  }

  return (
    <div className="relative mx-auto w-full max-w-[385px] h-[780px] bg-slate-900 rounded-[52px] border-[14px] border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans ring-4 ring-slate-850">
      {/* Speaker & notch */}
      <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-center z-50 pointer-events-none">
        <div className="w-28 h-5 bg-slate-800 rounded-b-2xl flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mr-2"></span>
          <span className="w-10 h-1 bg-slate-950 rounded-full"></span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 px-6 pt-2 bg-slate-900/50 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold z-40 select-none border-b border-slate-950/20 shrink-0">
        <span>09:41</span>
        <div className="flex items-center gap-1">
          <span className="text-[9px]">5G</span>
          <div className="w-4.5 h-2.5 border border-slate-600 rounded-sm p-0.2 flex items-center">
            <div className="h-full w-full bg-emerald-400 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* App Content inside phone */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 pb-16 scrollbar-none text-slate-200">
        <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-[10px] shrink-0">
          <div className="flex items-center gap-1.5 font-sans">
            <Smartphone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="font-bold text-slate-300">Modo Celular Ativo</span>
          </div>
          <button 
            onClick={onDisable}
            className="text-[9px] uppercase font-bold text-teal-400 hover:underline cursor-pointer"
          >
            Sair
          </button>
        </div>
        
        <div className="space-y-4 animate-in fade-in duration-300">
          {children}
        </div>
      </div>

      {/* iPhone home bar */}
      <div className="absolute bottom-1.5 inset-x-0 h-1 flex justify-center z-50 pointer-events-none">
        <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
      </div>
    </div>
  );
}

interface QuickExpenseLoggerWidgetProps {
  accounts: BankAccount[];
  onAddTransaction: (description: string, value: string, category: string, accountId: string) => void;
}

function QuickExpenseLoggerWidget({ accounts, onAddTransaction }: QuickExpenseLoggerWidgetProps) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc_01');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sync state if accounts load later
  useEffect(() => {
    if (accounts.length > 0 && !accounts.some(a => a.id === accountId)) {
      setAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !value) return;
    
    onAddTransaction(description, value, category, accountId);
    setDescription('');
    setValue('');
    setFeedback('Lançamento registrado! ⚡');
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Descrição</label>
          <input 
            type="text" 
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Padaria, Uber, etc." 
            className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Valor (R$)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00" 
            className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Categoria</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
          >
            <option value="Alimentação">🍔 Alimentação</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Moradia">🏠 Moradia</option>
            <option value="Lazer">🍿 Lazer</option>
            <option value="Outros">🏷️ Outros</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Conta Debitar</label>
          <select 
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-emerald-400 font-medium h-4 inline-block">
          {feedback && feedback}
        </span>
        <button 
          type="submit"
          className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Gasto
        </button>
      </div>
    </form>
  );
}

export default function FinanceDashboard({ onLogApiCall }: FinanceDashboardProps) {
  // Screens navigation manager
  // Supports all 25 screens!
  const [activeScreen, setActiveScreen] = useState<
    | 'splash' | 'login' | 'register' | 'forgot_password' // Auth (1-4)
    | 'dashboard' // Dashboard principal (5)
    | 'receitas' | 'despesas' | 'novo_lancamento' | 'editar_lancamento' // Transactions (6-9)
    | 'categorias' | 'contas' | 'cartoes' // Organization (10-12)
    | 'parcelamentos' | 'assinaturas' | 'metas' // Planning (13-15)
    | 'investimentos' | 'calendario' | 'relatorios' | 'ai_coach' | 'divisao_contas' // Analysis (16-19)
    | 'perfil' | 'configuracoes' | 'backup' | 'sobre' | 'notificacoes' // System (20-24)
    | 'pesquisa' | 'filtros' // Search (25-26)
    | 'usuarios' // Admin User Management
  >('splash');

  // Users Database with default persistent state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const cached = localStorage.getItem('financas_pro_users');
    let loadedUsers: UserAccount[] = [];
    if (cached) {
      try {
        loadedUsers = JSON.parse(cached);
      } catch (e) {
        console.error("Error parsing cached users", e);
      }
    }
    
    // Filter out old placeholder demo users if they are present
    const cleanUsers = loadedUsers.filter(u => u.email !== 'cris@financas.com' && u.email !== 'admin@financas.com');
    
    // Ensure the required Admin user exists in database
    if (!cleanUsers.some(u => u.email.toLowerCase() === 'cristianokuhn7@gmail.com')) {
      cleanUsers.push({ 
        id: 'usr_admin', 
        name: 'Cristiano Kuhn', 
        email: 'cristianokuhn7@gmail.com', 
        password: '978450', 
        role: 'admin', 
        createdAt: '2026-08-02',
        allowedScreens: ['dashboard', 'centro_financeiro', 'receitas', 'despesas', 'novo_lancamento', 'pesquisa', 'filtros', 'categorias', 'contas', 'cartoes', 'parcelamentos', 'assinaturas', 'metas', 'investimentos', 'calendario', 'relatorios', 'ai_coach', 'divisao_contas']
      });
    }
    return cleanUsers;
  });

  useEffect(() => {
    localStorage.setItem('financas_pro_users', JSON.stringify(users));
  }, [users]);

  // Current logged in user (starts at splash/login or loads cached session)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const cached = localStorage.getItem('financas_pro_current_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('financas_pro_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('financas_pro_current_user');
    }
  }, [currentUser]);

  // Dynamic state hooks mapped to session
  const userName = currentUser ? currentUser.name : 'Visitante';
  const userEmail = currentUser ? currentUser.email : '';
  const userRole = currentUser ? currentUser.role : 'user';

  // Force redirect to login if not authenticated and not on splash/login/register/forgot_password
  useEffect(() => {
    const isAuthPage = ['splash', 'login', 'register', 'forgot_password'].includes(activeScreen);
    if (!currentUser && !isAuthPage) {
      setActiveScreen('login');
    }
  }, [currentUser, activeScreen]);

  // Standard user dashboard permission guard
  useEffect(() => {
    const isAuthPage = ['splash', 'login', 'register', 'forgot_password'].includes(activeScreen);
    if (currentUser && !isAuthPage && userRole !== 'admin') {
      const systemScreens = ['perfil', 'configuracoes', 'notificacoes'];
      const allowed = currentUser.allowedScreens || [];
      const hasAccess = systemScreens.includes(activeScreen) || allowed.includes(activeScreen);
      if (!hasAccess) {
        setActiveScreen('dashboard');
      }
    }
  }, [currentUser, userRole, activeScreen]);

  const [activeMonth, setActiveMonth] = useState('2026-08');

  // Active navigation sidebar state (mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Mobile emulation mode
  const [isMobileEmulated, setIsMobileEmulated] = useState(false);

  // Architectural separation: Consumer vs Developer / Engineering Mode
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);

  // Family Mode vs Personal Mode
  const [isFamilyMode, setIsFamilyMode] = useState<boolean>(false);

  // Globally Available Floating AI Chat panel state
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);

  // Floating AI Chat Messages state
  const [floatingMessages, setFloatingMessages] = useState<Array<{sender: 'user' | 'ai', text: string, timestamp: string}>>([
    {
      sender: 'ai',
      text: 'Olá! Sou o seu Copiloto IA pessoal. Posso te ajudar a planejar parcelamentos, simular o ritmo de gastos, analisar seu fundo de emergência ou sugerir economias. O que gostaria de analisar agora?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [floatingInput, setFloatingInput] = useState('');
  const [isFloatingSending, setIsFloatingSending] = useState(false);

  // Simulated Database States with full persistent cache
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const cached = localStorage.getItem('financas_pro_accounts');
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter((a: any) => !['acc_01', 'acc_02', 'acc_03'].includes(a.id)) : [];
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const cached = localStorage.getItem('financas_pro_cards');
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter((c: any) => !['crd_01', 'crd_02'].includes(c.id)) : [];
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const cached = localStorage.getItem('financas_pro_goals');
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter((g: any) => !['goal_01', 'goal_02'].includes(g.id)) : [];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const cached = localStorage.getItem('financas_pro_subscriptions');
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter((s: any) => !['sub_netflix', 'sub_spotify', 'sub_apple'].includes(s.id)) : [];
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const cached = localStorage.getItem('financas_pro_investments');
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter((i: any) => !['inv_01', 'inv_02'].includes(i.id)) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem('financas_pro_transactions');
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter((t: any) => 
      !['txn_01', 'txn_02', 'txn_03', 'txn_jul_01', 'txn_jul_02', 'txn_jul_03'].includes(t.id) && 
      !(t.id && t.id.startsWith('txn_seed_'))
    ) : [];
  });

  // Persists states back to local storage
  useEffect(() => {
    localStorage.setItem('financas_pro_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('financas_pro_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('financas_pro_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('financas_pro_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('financas_pro_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('financas_pro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // No automatic transaction seeding so the database remains completely manual for live testing

  const [editingTransactionId, setEditingTransactionId] = useState<string | undefined>(undefined);

  const [sheetsUrl, setSheetsUrl] = useState(() => {
    return localStorage.getItem('financas_pro_sheets_url') || 'https://script.google.com/macros/s/AKfycbwwgo-_-H4eU97tS9vtl1N6E44kJ-DcKJoCXZCtOSX9gs48c5hnFv0XOT4gpxO9OTRs/exec';
  });

  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('financas_pro_sheets_url', sheetsUrl);
  }, [sheetsUrl]);

  const syncFromSheets = async (urlToUse = sheetsUrl) => {
    if (!urlToUse) return;
    setIsLoadingSheets(true);
    setSheetsError(null);
    try {
      const response = await fetch(`${urlToUse}?action=obter_dados_completos&usuario_id=usr_f89b1c72`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Planilha ou Web App do Google Sheets não encontrado (HTTP 404). Configure seu Web App em Backups & GSheets.');
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.lancamentos && Array.isArray(d.lancamentos) && d.lancamentos.length > 0) {
          const mappedTxns = d.lancamentos.map((t: any) => ({
            id: t.id,
            description: t.descricao || '',
            amount: parseFloat(t.valor) || 0,
            type: t.tipo || 'DESPESA',
            category: t.categoria_id || 'Alimentação',
            subcategory: t.subcategoria_id || '',
            accountId: t.conta_id || 'acc_01',
            cardId: t.cartao_id || undefined,
            paymentMethod: t.forma_pagamento || 'PIX',
            date: t.data_hora ? t.data_hora.substring(0, 10) : new Date().toISOString().substring(0, 10),
            time: t.data_hora ? t.data_hora.substring(11, 16) : '12:00',
            status: t.status || 'PAGO'
          }));
          setTransactions(mappedTxns);
        }
        if (d.contas && Array.isArray(d.contas) && d.contas.length > 0) {
          const mappedAccs = d.contas.map((a: any) => ({
            id: a.id,
            name: a.nome || '',
            type: a.tipo || 'CORRENTE',
            bankName: a.instituicao || '',
            balance: parseFloat(a.saldo_atual) || 0,
            createdAt: a.criado_em ? a.criado_em.substring(0, 10) : new Date().toISOString().substring(0, 10)
          }));
          setAccounts(mappedAccs);
        }
        if (d.cartoes && Array.isArray(d.cartoes) && d.cartoes.length > 0) {
          const mappedCards = d.cartoes.map((c: any) => ({
            id: c.id,
            name: c.nome || '',
            bankName: c.instituicao || '',
            limit: parseFloat(c.limite_total) || 10000.00,
            usedLimit: parseFloat(c.limite_utilizado) || 0,
            availableLimit: (parseFloat(c.limite_total) || 10000.00) - (parseFloat(c.limite_utilizado) || 0),
            invoiceClosingDay: parseInt(c.dia_fechamento) || 25,
            invoiceDueDay: parseInt(c.dia_vencimento) || 5,
            bestPurchaseDay: parseInt(c.dia_fechamento) + 1,
            color: c.cor_hex || 'from-purple-900 to-indigo-950'
          }));
          setCards(mappedCards);
        }
        if (d.metas && Array.isArray(d.metas) && d.metas.length > 0) {
          const mappedGoals = d.metas.map((g: any) => ({
            id: g.id,
            name: g.nome || '',
            description: g.descricao || '',
            targetAmount: parseFloat(g.valor_objetivo) || 1000,
            currentAmount: parseFloat(g.valor_atual) || 0,
            targetDate: g.data_limite ? g.data_limite.substring(0, 10) : '',
            category: 'Geral'
          }));
          setGoals(mappedGoals);
        }
        if (d.assinaturas && Array.isArray(d.assinaturas) && d.assinaturas.length > 0) {
          const mappedSubs = d.assinaturas.map((s: any) => ({
            id: s.id,
            name: s.nome || '',
            amount: parseFloat(s.valor) || 0,
            category: s.categoria_id || 'Lazer',
            dueDate: parseInt(s.dia_vencimento) || 15,
            paymentMethod: 'Nubank UV',
            active: s.status === 'ATIVO',
            logo: '🍿'
          }));
          setSubscriptions(mappedSubs);
        }
        if (d.investimentos && Array.isArray(d.investimentos) && d.investimentos.length > 0) {
          const mappedInvs = d.investimentos.map((i: any) => ({
            id: i.id,
            name: i.nome || '',
            type: i.tipo || 'CDB',
            institution: i.instituicao || '',
            investedAmount: parseFloat(i.valor_aplicado) || 0,
            currentAmount: parseFloat(i.valor_atual) || 0,
            yieldRate: '100% CDI',
            yieldProfit: (parseFloat(i.valor_atual) || 0) - (parseFloat(i.valor_aplicado) || 0)
          }));
          setInvestments(mappedInvs);
        }

        if (d.usuarios && Array.isArray(d.usuarios) && d.usuarios.length > 0) {
          const mappedUsers = d.usuarios.map((u: any) => {
            let allowed: string[] = [];
            try {
              if (u.telas_permitidas) {
                allowed = JSON.parse(u.telas_permitidas);
              }
            } catch (e) {
              if (typeof u.telas_permitidas === 'string') {
                allowed = u.telas_permitidas.split(',');
              }
            }
            if (!allowed || allowed.length === 0) {
              allowed = ['dashboard', 'centro_financeiro', 'receitas', 'despesas', 'novo_lancamento', 'pesquisa', 'filtros'];
            }
            return {
              id: u.id,
              name: u.nome || '',
              email: u.email || '',
              password: u.senha_hash || '',
              role: (u.cargo === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
              createdAt: u.criado_em ? u.criado_em.substring(0, 10) : new Date().toISOString().substring(0, 10),
              allowedScreens: allowed
            };
          });

          // Ensure our primary admin is always present and updated
          if (!mappedUsers.some(u => u.email.toLowerCase() === 'cristianokuhn7@gmail.com')) {
            mappedUsers.push({ 
              id: 'usr_admin', 
              name: 'Cristiano Kuhn', 
              email: 'cristianokuhn7@gmail.com', 
              password: '978450', 
              role: 'admin', 
              createdAt: '2026-08-02',
              allowedScreens: ['dashboard', 'centro_financeiro', 'receitas', 'despesas', 'novo_lancamento', 'pesquisa', 'filtros', 'categorias', 'contas', 'cartoes', 'parcelamentos', 'assinaturas', 'metas', 'investimentos', 'calendario', 'relatorios', 'ai_coach', 'divisao_contas']
            });
          }
          setUsers(mappedUsers);
        }

        if (onLogApiCall) {
          onLogApiCall({
            endpoint: '/obter_dados_completos',
            method: 'GET',
            response: JSON.stringify(result, null, 2),
            technicalSteps: [
              `[Real Integration] Sincronização automática de dados realizada com o Sheets.`,
              `[Network] GET request enviado com sucesso para: ${urlToUse}`,
              `[Response] Recebidos ${d.lancamentos?.length || 0} lançamentos e ${d.contas?.length || 0} contas do banco de dados.`
            ]
          });
        }
      } else {
        throw new Error(result.error || 'Erro no processamento do Apps Script');
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.warn("Sheets sync notice:", errorMsg);
      setSheetsError(errorMsg);
      if (onLogApiCall) {
        onLogApiCall({
          endpoint: '/obter_dados_completos',
          method: 'GET',
          response: JSON.stringify({ success: false, error: errorMsg }, null, 2),
          technicalSteps: [
            `[Real Integration] Tentativa de sincronização com o Sheets falhou.`,
            `[Fallback] Usando cache e dados locais para garantir o funcionamento do app offline.`
          ]
        });
      }
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const postToSheets = async (action: 'CRIAR' | 'EDITAR' | 'DELETAR', entity: string, data: any) => {
    if (!urlToUseRaw) return;
    try {
      const payload = {
        action,
        entidade: entity,
        data,
        usuario_id: 'usr_f89b1c72',
        email_usuario: userEmail
      };

      const response = await fetch(urlToUseRaw, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      let resultText = '';
      if (response.ok) {
        try {
          const result = await response.json();
          resultText = JSON.stringify(result, null, 2);
        } catch (e) {
          resultText = `Sincronizado no Sheets! (Gravado com sucesso)`;
        }
      } else {
        resultText = `Servidor retornou status ${response.status}`;
      }

      if (onLogApiCall) {
        onLogApiCall({
          endpoint: `/${entity}`,
          method: 'POST',
          payload: JSON.stringify(payload, null, 2),
          response: resultText,
          technicalSteps: [
            `[Real Integration] Executando ${action} na aba '${entity}' do Sheets.`,
            `[Network] POST request enviado para: ${urlToUseRaw}`,
            `[Status] Concluído.`
          ]
        });
      }

      // Update local state by fetching newly modified state from GSheets
      setTimeout(() => syncFromSheets(urlToUseRaw), 1000);
    } catch (err: any) {
      console.error("Sheets post error:", err);
      if (onLogApiCall) {
        onLogApiCall({
          endpoint: `/${entity}`,
          method: 'POST',
          payload: JSON.stringify(data, null, 2),
          response: JSON.stringify({ success: false, error: err.message || String(err) }, null, 2),
          technicalSteps: [
            `[Real Integration] Erro ao enviar dados para o Google Sheets.`,
            `[Info] A transação foi mantida no estado local do seu navegador.`
          ]
        });
      }
    }
  };

  const urlToUseRaw = sheetsUrl;

  useEffect(() => {
    syncFromSheets();
  }, []);

  // Months available for selector - dynamically calculated based on the active year
  const activeYear = activeMonth.substring(0, 4);
  const months = [
    { value: `${activeYear}-01`, label: 'Jan' },
    { value: `${activeYear}-02`, label: 'Fev' },
    { value: `${activeYear}-03`, label: 'Mar' },
    { value: `${activeYear}-04`, label: 'Abr' },
    { value: `${activeYear}-05`, label: 'Mai' },
    { value: `${activeYear}-06`, label: 'Jun' },
    { value: `${activeYear}-07`, label: 'Jul' },
    { value: `${activeYear}-08`, label: 'Ago' },
    { value: `${activeYear}-09`, label: 'Set' },
    { value: `${activeYear}-10`, label: 'Out' },
    { value: `${activeYear}-11`, label: 'Nov' },
    { value: `${activeYear}-12`, label: 'Dez' },
  ];

  // Auto-calculated fields for current active month
  const activeTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(activeMonth));
  }, [transactions, activeMonth]);

  const kpis = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let totalInvested = 0;

    activeTransactions.forEach(t => {
      if (t.type === 'RECEITA') {
        totalIn += t.amount;
      } else if (t.type === 'DESPESA') {
        totalOut += t.amount;
      } else if (t.type === 'INVESTIMENTO') {
        totalInvested += t.amount;
      }
    });

    const currentBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    const economy = totalIn - totalOut;

    return {
      balance: currentBalance,
      income: totalIn,
      expense: totalOut,
      economy: economy,
      invested: totalInvested
    };
  }, [activeTransactions, accounts]);

  // Derived 10-second visual cockpit metrics
  const cockpitStats = useMemo(() => {
    const totalAccountBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    const totalInvestments = investments.reduce((acc, i) => acc + i.currentAmount, 0);
    const patrimonioTotal = totalAccountBalance + totalInvestments;
    
    // Configurable/Standardized monthly planning limit calculated dynamically from Category Limits
    let dynamicCategoryLimitsSum = 0;
    try {
      const cachedLimits = localStorage.getItem('financas_clean_category_limits');
      if (cachedLimits) {
        const parsed = JSON.parse(cachedLimits);
        if (parsed && typeof parsed === 'object') {
          dynamicCategoryLimitsSum = (Object.values(parsed) as (string|number)[]).reduce<number>((acc, val) => acc + (parseFloat(String(val)) || 0), 0);
        }
      }
    } catch (e) {}

    const budgetLimit = dynamicCategoryLimitsSum > 0 ? dynamicCategoryLimitsSum : 7800;
    const percentualUtilizado = Math.min(100, Math.round((kpis.expense / budgetLimit) * 100));
    const quantoPodeGastar = Math.max(0, budgetLimit - kpis.expense);
    
    // Subscriptions and predicted regular recurring outlays
    const recurringOutlays = subscriptions.reduce((acc, s) => acc + (s.active ? s.amount : 0), 0);
    const gastosPrevistos = kpis.expense + recurringOutlays;

    // Filter status pending bills for overdue alerts
    const todayStr = '2026-08-01'; // simulated baseline competency today
    const contasVencidas = transactions.filter(t => t.status === 'PENDENTE' && t.date < todayStr).length;
    const contasVencemHoje = transactions.filter(t => t.status === 'PENDENTE' && t.date === todayStr).length;
    
    const proximosVencimentosList = transactions.filter(t => 
      t.status === 'PENDENTE' && t.date > todayStr && t.date <= '2026-08-10'
    ).map(t => ({
      description: t.description,
      amount: t.amount,
      date: t.date
    }));

    // Credit card current consolidated statements
    const faturaCartao = activeTransactions.filter(t => t.cardId).reduce((acc, t) => acc + t.amount, 0);
    
    // Savings target progress metrics
    const metaMensal = goals.reduce((acc, g) => acc + g.targetAmount, 0);

    return {
      patrimonioTotal,
      budgetLimit,
      percentualUtilizado,
      quantoPodeGastar,
      gastosPrevistos,
      contasVencidas,
      contasVencemHoje,
      proximosVencimentosList,
      faturaCartao,
      metaMensal
    };
  }, [accounts, investments, transactions, kpis, subscriptions, activeTransactions, goals]);

  // Category chart aggregates for Active month
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    let totalOut = 0;

    activeTransactions.filter(t => t.type === 'DESPESA').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
      totalOut += t.amount;
    });

    const colors: Record<string, string> = {
      'Alimentação': 'bg-rose-500',
      'Transporte': 'bg-teal-500',
      'Moradia': 'bg-indigo-500',
      'Lazer': 'bg-purple-500',
      'Saúde': 'bg-emerald-500',
      'Assinaturas': 'bg-amber-500'
    };

    return Object.entries(map).map(([cat, val]) => ({
      name: cat,
      value: val,
      percentage: totalOut > 0 ? Math.round((val / totalOut) * 100) : 0,
      color: colors[cat] || 'bg-slate-400'
    })).sort((a, b) => b.value - a.value);
  }, [activeTransactions]);

  // Action methods to update general database state
  const handleAddTransaction = (newTxn: Transaction) => {
    setTransactions(prev => [newTxn, ...prev]);

    // Update balances
    if (newTxn.paymentMethod === 'CREDITO') {
      setCards(prev => prev.map(c => {
        if (c.id === newTxn.cardId) {
          const used = c.usedLimit + newTxn.amount;
          return {
            ...c,
            usedLimit: used,
            availableLimit: c.limit - used
          };
        }
        return c;
      }));
    } else {
      setAccounts(prev => prev.map(a => {
        if (a.id === newTxn.accountId) {
          let bal = a.balance;
          if (newTxn.type === 'RECEITA') {
            bal += newTxn.amount;
          } else {
            bal -= newTxn.amount;
          }
          return { ...a, balance: bal };
        }
        return a;
      }));
    }

    // Map and post to sheets
    const sheetsData = {
      id: newTxn.id,
      descricao: newTxn.description,
      categoria_id: newTxn.category,
      subcategory_id: newTxn.subcategory || '',
      conta_id: newTxn.accountId,
      cartao_id: newTxn.cardId || '',
      valor: newTxn.amount,
      tipo: newTxn.type,
      forma_pagamento: newTxn.paymentMethod,
      data_competencia: newTxn.date.substring(0, 7),
      data_hora: `${newTxn.date}T${newTxn.time || '12:00'}:00.000Z`,
      status: newTxn.status || 'PAGO'
    };

    postToSheets('CRIAR', 'lancamentos', sheetsData);
  };

  const handleEditTransaction = (updatedTxn: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTxn.id ? updatedTxn : t));
    
    const sheetsData = {
      id: updatedTxn.id,
      descricao: updatedTxn.description,
      categoria_id: updatedTxn.category,
      subcategory_id: updatedTxn.subcategory || '',
      conta_id: updatedTxn.accountId,
      cartao_id: updatedTxn.cardId || '',
      valor: updatedTxn.amount,
      tipo: updatedTxn.type,
      forma_pagamento: updatedTxn.paymentMethod,
      data_competencia: updatedTxn.date.substring(0, 7),
      data_hora: `${updatedTxn.date}T${updatedTxn.time || '12:00'}:00.000Z`,
      status: updatedTxn.status || 'PAGO'
    };

    postToSheets('EDITAR', 'lancamentos', sheetsData);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    postToSheets('DELETAR', 'lancamentos', { id });
  };

  const handleAddAccount = (newAcc: BankAccount) => {
    setAccounts(prev => [...prev, newAcc]);
  };

  const handleUpdateAccount = (id: string, updatedFields: Partial<BankAccount>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleAddCard = (newCard: CreditCard) => {
    setCards(prev => [...prev, newCard]);
  };

  const handleUpdateCard = (id: string, updatedFields: Partial<CreditCard>) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updatedFields };
        return {
          ...updated,
          availableLimit: updated.limit - updated.usedLimit
        };
      }
      return c;
    }));
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCardLimit = (id: string, limit: number) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          limit,
          availableLimit: limit - c.usedLimit
        };
      }
      return c;
    }));
  };

  const handleAddGoal = (newGoal: FinancialGoal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const handleAddSubscription = (newSub: Subscription) => {
    setSubscriptions(prev => [newSub, ...prev]);
  };

  const handleDepositToGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          currentAmount: g.currentAmount + amount
        };
      }
      return g;
    }));
  };

  const handleAddInvestment = (newInv: Investment) => {
    setInvestments(prev => [...prev, newInv]);
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('financas_pro_transactions');
    localStorage.removeItem('financas_pro_accounts');
    localStorage.removeItem('financas_pro_cards');
    localStorage.removeItem('financas_pro_goals');
    localStorage.removeItem('financas_pro_subscriptions');
    localStorage.removeItem('financas_pro_investments');
    localStorage.removeItem('financas_pro_users');
    localStorage.removeItem('financas_pro_current_user');

    setTransactions([]);
    setAccounts([]);
    setCards([]);
    setGoals([]);
    setSubscriptions([]);
    setInvestments([]);
    
    const masterAdmin: UserAccount = { 
      id: 'usr_admin', 
      name: 'Cristiano Kuhn', 
      email: 'cristianokuhn7@gmail.com', 
      password: '978450', 
      role: 'admin', 
      createdAt: '2026-08-02',
      allowedScreens: AVAILABLE_SCREENS.map(s => s.id)
    };
    
    setUsers([masterAdmin]);
    setCurrentUser(null);
    setActiveScreen('login');
  };

  const handleSendFloatingMessage = async (textToSend?: string) => {
    const msgText = (textToSend || floatingInput).trim();
    if (!msgText || isFloatingSending) return;

    if (!textToSend) {
      setFloatingInput('');
    }

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setFloatingMessages(prev => [...prev, { sender: 'user', text: msgText, timestamp: timeStr }]);
    setIsFloatingSending(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          activeMonth,
          transactions,
          accounts,
          cards,
          goals,
          subscriptions,
          investments,
          customQuestion: msgText
        })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      const reply = data.summary || "Com base em seus dados, recomendo focar na otimização das contas de lazer para manter a meta de economia ativa este mês.";
      
      setFloatingMessages(prev => [...prev, {
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setFloatingMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Desculpe, tive um problema de conexão com meus servidores de inteligência artificial. Por favor, tente enviar novamente em alguns instantes.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsFloatingSending(false);
    }
  };

  const handleAddUser = (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const userWithId: UserAccount = {
      ...newUser,
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString().substring(0, 10),
      allowedScreens: newUser.allowedScreens || AVAILABLE_SCREENS.map(s => s.id)
    };
    setUsers(prev => [...prev, userWithId]);

    // Send payload to GSheets
    const sheetsData = {
      id: userWithId.id,
      nome: userWithId.name,
      email: userWithId.email,
      senha_hash: userWithId.password,
      cargo: userWithId.role,
      telas_permitidas: JSON.stringify(userWithId.allowedScreens),
      status: 'ATIVO',
      criado_em: new Date().toISOString(),
      alterado_em: new Date().toISOString(),
      criado_por: userEmail
    };
    postToSheets('CRIAR', 'usuarios', sheetsData);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    postToSheets('DELETAR', 'usuarios', { id });
  };

  const handleUpdateUser = (id: string, updatedFields: Partial<UserAccount>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updatedFields };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
        }

        // Send payload to GSheets
        const sheetsData = {
          id: updated.id,
          nome: updated.name,
          email: updated.email,
          senha_hash: updated.password,
          cargo: updated.role,
          telas_permitidas: JSON.stringify(updated.allowedScreens),
          alterado_em: new Date().toISOString()
        };
        postToSheets('EDITAR', 'usuarios', sheetsData);

        return updated;
      }
      return u;
    }));
  };

  const handleUpdateUserPassword = (email: string, newPassword: string): boolean => {
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex !== -1) {
      const u = users[userIndex];
      const updated = { ...u, password: newPassword };
      setUsers(prev => prev.map(usr => usr.email.toLowerCase() === email.toLowerCase() ? updated : usr));

      const sheetsData = {
        id: updated.id,
        nome: updated.name,
        email: updated.email,
        senha_hash: updated.password,
        cargo: updated.role,
        telas_permitidas: JSON.stringify(updated.allowedScreens),
        alterado_em: new Date().toISOString()
      };
      postToSheets('EDITAR', 'usuarios', sheetsData);
      return true;
    }
    return false;
  };

  const handleRegisterUser = (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => {
    handleAddUser({
      ...newUser,
      allowedScreens: ['dashboard', 'centro_financeiro', 'receitas', 'despesas', 'novo_lancamento', 'pesquisa', 'filtros']
    });
  };

  // Helper lists of screens categories for the Sovereign sidebar router
  const screenCategories = useMemo(() => {
    const isScreenAllowed = (id: string) => {
      if (userRole === 'admin') return true;
      if (!currentUser) return false;
      if (!currentUser.allowedScreens) return true;
      return currentUser.allowedScreens.includes(id);
    };

    const categories = [
      ...(isDeveloperMode ? [{
        title: 'Acesso e Registro (Dev)',
        items: [
          { id: 'splash', label: '1. Splash Screen', icon: Sparkles },
          { id: 'login', label: '2. Tela de Login', icon: ShieldCheck },
          { id: 'register', label: '3. Tela de Cadastro', icon: User },
          { id: 'forgot_password', label: '4. Recuperação Senha', icon: Clock },
        ]
      }] : []),
      {
        title: 'Principal',
        items: [
          { id: 'dashboard', label: 'Painel Geral', icon: Grid },
          { id: 'centro_financeiro', label: 'Centro Financeiro Hub', icon: Activity },
        ].filter(item => isScreenAllowed(item.id))
      },
      {
        title: 'Lançamentos',
        items: [
          { id: 'receitas', label: 'Painel Receitas', icon: ArrowUpRight },
          { id: 'despesas', label: 'Painel Despesas', icon: ArrowDownRight },
          { id: 'novo_lancamento', label: 'Novo Lançamento', icon: Plus },
          { id: 'pesquisa', label: 'Pesquisa Global', icon: Search },
          { id: 'filtros', label: 'Filtros Avançados', icon: Sliders },
        ].filter(item => isScreenAllowed(item.id))
      },
      {
        title: 'Organização',
        items: [
          { id: 'categorias', label: 'Categorias & Limites', icon: Info },
          { id: 'contas', label: 'Contas Bancárias', icon: Wallet },
          { id: 'cartoes', label: 'Cartões de Crédito', icon: CardIcon },
        ].filter(item => isScreenAllowed(item.id))
      },
      {
        title: 'Planejamento',
        items: [
          { id: 'parcelamentos', label: 'Parcelamentos', icon: Calendar },
          { id: 'assinaturas', label: 'Assinaturas / SaaS', icon: Clock },
          { id: 'metas', label: 'Metas & Objetivos', icon: Award },
        ].filter(item => isScreenAllowed(item.id))
      },
      {
        title: 'Análise e Relatórios',
        items: [
          { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
          { id: 'calendario', label: 'Calendário & Fluxo', icon: Calendar },
          { id: 'relatorios', label: 'Relatórios Fiscais', icon: TrendingUp },
          { id: 'ai_coach', label: 'Mentor IA (Coach)', icon: Sparkles },
          { id: 'divisao_contas', label: 'Divisão Ale & Cris', icon: Users },
        ].filter(item => isScreenAllowed(item.id))
      },
      {
        title: 'Sistema e Info',
        items: [
          { id: 'perfil', label: 'Seu Perfil', icon: User },
          { id: 'configuracoes', label: 'Configurações', icon: Settings },
          ...(isDeveloperMode ? [
            { id: 'backup', label: 'Backup & GSheets', icon: Database },
            { id: 'sobre', label: 'Sobre a Plataforma', icon: Info },
          ] : []),
          ...(userRole === 'admin' ? [{ id: 'usuarios', label: 'Gerenciar Usuários 👑', icon: Users }] : []),
          { id: 'notificacoes', label: 'Notificações / Alertas', icon: Bell },
        ].filter(item => isScreenAllowed(item.id))
      }
    ];

    return categories.filter(cat => cat.items.length > 0);
  }, [userRole, isDeveloperMode, currentUser]);

  // Helper text to get active screen name label
  const getScreenLabel = (id: string) => {
    if (id === 'usuarios') return '👑 Gerenciar Usuários (Admin)';
    for (const cat of screenCategories) {
      const found = cat.items.find(i => i.id === id);
      if (found) return found.label;
    }
    if (id === 'editar_lancamento') return '9. Editar Lançamento';
    return id;
  };

  // Switch wrapper to allow trigger editing screen easily
  const handleTriggerEditScreen = (id: string) => {
    setEditingTransactionId(id);
    setActiveScreen('editar_lancamento');
  };

  const isAuthScreenActive = ['splash', 'login', 'register', 'forgot_password'].includes(activeScreen);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-white font-sans antialiased" id="premium-finance-workspace">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className={`lg:w-80 border-r border-slate-900 bg-slate-950 flex flex-col justify-between shrink-0 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-40' : '-translate-x-full lg:static'
      }`}>
        <div className="flex flex-col h-full overflow-y-auto pb-4">
          {/* Logo header */}
          <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/60 sticky top-0 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-lg flex items-center justify-center p-0.5 shadow-md shadow-teal-500/10">
                <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-teal-400" />
                </div>
              </div>
              <div>
                <h1 className="font-black text-sm tracking-tight font-display bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  FINANÇAS CLEAN
                </h1>
                <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">FlutterFlow UI v1.4</p>
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 bg-slate-900 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of screens groups (25 screens) */}
          <div className="p-4 space-y-6">
            {screenCategories.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-2">{group.title}</h3>
                
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeScreen === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveScreen(item.id as any);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/10' 
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User profile fast card at the bottom of the sidebar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div 
            onClick={() => setActiveScreen('perfil')}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[9px] text-slate-500 truncate font-mono">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Background shade overlay on mobile when sidebar drawer is open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-35 lg:hidden"
        ></div>
      )}

      {/* 2. Main app content wrapper */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Top Header Bar */}
        <header className="px-6 py-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/40 sticky top-0 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Visualizador de Telas Ativo</p>
              <h2 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                {getScreenLabel(activeScreen)}
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse"></span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Family Mode Switcher (Point 14) */}
            <button
              onClick={() => setIsFamilyMode(!isFamilyMode)}
              className={`p-1.5 border rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                isFamilyMode 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/10' 
                  : 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-400'
              }`}
              title="Alternar entre perfil Pessoal e Familiar!"
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">{isFamilyMode ? 'Familiar (Ale & Cris)' : 'Pessoal (Cristiano)'}</span>
            </button>

            {/* Decoupled Architecture separation switcher (Point 1) */}
            <button
              onClick={() => setIsDeveloperMode(!isDeveloperMode)}
              className={`p-1.5 border rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                isDeveloperMode 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10 font-black' 
                  : 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-400'
              }`}
              title="Alternar Modo Engenharia (Documentação/Simuladores) e Modo Aplicativo Consumidor!"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">{isDeveloperMode ? 'Engenharia / Simulador' : 'Aplicativo Pro'}</span>
            </button>

            {/* Mobile View Toggle Button (1 click to simulate/adapt to phone screen) */}
            <button
              onClick={() => setIsMobileEmulated(!isMobileEmulated)}
              className={`p-1.5 border rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                isMobileEmulated 
                  ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold shadow-md shadow-teal-500/10 animate-pulse' 
                  : 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-300'
              }`}
              title="Alternar para tela de celular com um clique!"
            >
              <Smartphone className="w-4 h-4" /> 
              <span className="hidden md:inline">{isMobileEmulated ? 'Tela de Celular' : 'Adaptar Celular'}</span>
            </button>

            {/* Quick search shortcut */}
            <button
              onClick={() => setActiveScreen('pesquisa')}
              className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> <span className="hidden sm:inline">Pesquisa</span>
            </button>

            {/* Quick notifications popover toggle */}
            <button 
              onClick={() => setActiveScreen('notificacoes')}
              className="p-1.5 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg relative cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>

            <span className="h-6 w-px bg-slate-900 hidden sm:block"></span>

            {/* Competency fast display */}
            <div className="hidden sm:block text-right">
              <p className="text-[9px] text-slate-500 uppercase font-mono">Mês de Competência</p>
              <p className="text-xs font-bold text-white">Agosto 2026</p>
            </div>
          </div>
        </header>

        {/* 3. Screen Router Grid block */}
        <div className={`p-6 w-full flex-1 ${isMobileEmulated ? 'flex items-center justify-center py-10 bg-slate-950/40' : 'w-full max-w-[1750px] mx-auto'}`}>
          <PhoneEmulatorWrapper enabled={isMobileEmulated} onDisable={() => setIsMobileEmulated(false)}>
            {isAuthScreenActive && (
              <AuthScreens 
                currentScreen={activeScreen as any} 
                setScreen={setActiveScreen as any} 
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                }}
                users={users}
                onRegisterUser={handleRegisterUser}
                onUpdateUserPassword={handleUpdateUserPassword}
              />
            )}

          {/* Screen 5: Dashboard Principal (Home layout) */}
          {activeScreen === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Competência bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <h3 className="text-xs text-slate-500 font-medium tracking-wide uppercase">Selecione a Competência Ativa</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-lg font-bold text-white font-display">
                        {months.find(m => m.value === activeMonth)?.label} {activeYear}
                      </span>
                      <span className="text-xs bg-teal-950/60 text-teal-400 border border-teal-900/30 px-2 py-0.5 rounded-full font-semibold ml-2 font-mono">
                        Sincronizado Sheets API
                      </span>
                    </div>
                  </div>

                  {/* Year selector select */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Ano:</span>
                    <select
                      value={activeYear}
                      onChange={(e) => {
                        const newYear = e.target.value;
                        const monthPart = activeMonth.substring(5); // e.g. "08"
                        setActiveMonth(`${newYear}-${monthPart}`);
                      }}
                      className="bg-transparent text-white rounded-lg text-xs font-black px-1 py-1 focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="2025" className="bg-slate-900">2025</option>
                      <option value="2026" className="bg-slate-900">2026</option>
                      <option value="2027" className="bg-slate-900">2027</option>
                      <option value="2028" className="bg-slate-900">2028</option>
                      <option value="2029" className="bg-slate-900">2029</option>
                      <option value="2030" className="bg-slate-900">2030</option>
                    </select>
                  </div>
                </div>

                {/* Horizontal month selector */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {months.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setActiveMonth(m.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeMonth === m.value 
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm' 
                          : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* === Personalized Greetings Panel (Point 3) === */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-5">
                  <Sparkles className="w-48 h-48 text-teal-400" />
                </div>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold uppercase text-[10px] tracking-widest font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Copiloto Inteligente Ativo
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white font-display">
                    {isFamilyMode ? 'Bom dia, Família Ale & Cris! 🏡' : `Olá, ${userName}! ☕`}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    Hoje é <strong>dia 02 de {(() => {
                      const monthNamesStr: Record<string, string> = {
                        '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
                        '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
                        '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
                      };
                      return monthNamesStr[activeMonth.substring(5, 7)] || 'Agosto';
                    })()} de {activeYear}</strong>. Com base no seu orçamento planejado de <strong>R$ 8.500</strong>, você possui <strong>R$ {cockpitStats.quantoPodeGastar.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong> livres para gastos discricionários este mês para manter seu ritmo de poupança intacto.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={() => setIsAiChatOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer shadow-md shadow-teal-500/10"
                  >
                    <BrainCircuit className="w-4 h-4" /> Perguntar ao Copiloto
                  </button>
                  <button 
                    onClick={() => setActiveScreen('centro_financeiro')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 font-bold rounded-xl text-xs border border-slate-850 transition-all cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-purple-400" /> Centro Financeiro
                  </button>
                </div>
              </div>

              {/* === Point 1: 10-Second Executive Financial Cockpit === */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md relative overflow-hidden" id="10-sec-cockpit">
                <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-5">
                  <BrainCircuit className="w-48 h-48 text-teal-400" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Radar de Saúde Financeira em 10 Segundos
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('ai_coach')}
                    className="px-2.5 py-1 bg-teal-950 text-teal-400 border border-teal-900/40 hover:bg-teal-900 hover:text-slate-950 transition-all text-[10px] font-mono font-bold rounded-lg cursor-pointer"
                  >
                    Abrir Auditor IA →
                  </button>
                </div>

                {/* Overdue/Urgent Alert Bar (Alerts Point 17) */}
                {(cockpitStats.contasVencidas > 0 || cockpitStats.contasVencemHoje > 0) ? (
                  <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-start gap-2 text-xs text-rose-300">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Ação Corretiva Urgente Requerida</p>
                        <p className="text-[11px] text-rose-400/80">
                          Detectamos <strong className="text-rose-300">{cockpitStats.contasVencidas} contas vencidas</strong> e <strong className="text-rose-300">{cockpitStats.contasVencemHoje} faturas que vencem hoje</strong>. Evite multas de mora pagando agora.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveScreen('calendario')}
                      className="px-3 py-1 bg-rose-500 text-slate-950 font-bold rounded text-[10px] uppercase hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Pagar via Pix
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-[11px]">
                      Excelente! Nenhuma fatura vencida ou vencendo hoje. Seus compromissos estão 100% regulares. Próximos 10 dias: {cockpitStats.proximosVencimentosList.length} contas pendentes.
                    </p>
                  </div>
                )}

                {/* Grid of critical cockpit metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  
                  {/* Item 1: Net Worth */}
                  <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Patrimônio Total</p>
                    <p className="text-base font-black text-white mt-1 font-mono">
                      R$ {cockpitStats.patrimonioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-teal-400 font-bold bg-teal-950/20 border border-teal-900/30 px-1 py-0.2 rounded inline-block mt-1 font-mono">
                      Contas + Ações
                    </span>
                  </div>

                  {/* Item 2: Remaining budget to spend */}
                  <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Ainda Pode Gastar</p>
                    <p className={`text-base font-black mt-1 font-mono ${cockpitStats.quantoPodeGastar > 1500 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      R$ {cockpitStats.quantoPodeGastar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-slate-400 inline-block mt-1">
                      Limite Planejado: R$ {cockpitStats.budgetLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Item 3: Forecast outlays */}
                  <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Previsto até Fim do Mês</p>
                    <p className="text-base font-black text-slate-300 mt-1 font-mono">
                      R$ {cockpitStats.gastosPrevistos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-slate-400 inline-block mt-1">
                      Lançamentos + SaaS
                    </span>
                  </div>

                  {/* Item 4: Active credit card statement balance */}
                  <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Fatura do Cartão</p>
                    <p className="text-base font-black text-purple-400 mt-1 font-mono">
                      R$ {cockpitStats.faturaCartao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-slate-400 inline-block mt-1">
                      Nubank UV + Visa Infinite
                    </span>
                  </div>

                  {/* Item 5: Budget consumption rate */}
                  <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl col-span-2 md:col-span-1">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Consumo do Orçamento</p>
                    <p className="text-base font-black text-white mt-1 font-mono">
                      {cockpitStats.percentualUtilizado}%
                    </p>
                    
                    {/* Visual bar tracker inside the item */}
                    <div className="w-full bg-slate-900 border border-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={`h-full ${cockpitStats.percentualUtilizado > 80 ? 'bg-rose-500' : cockpitStats.percentualUtilizado > 50 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${cockpitStats.percentualUtilizado}%` }}
                      ></div>
                    </div>
                  </div>

                </div>

                {/* Fast schedule log */}
                {cockpitStats.proximosVencimentosList.length > 0 && (
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[10px] text-slate-400 border-t border-slate-850">
                    <span className="font-bold uppercase font-mono">Próximos Vencimentos:</span>
                    <div className="flex flex-wrap gap-2">
                      {cockpitStats.proximosVencimentosList.slice(0, 3).map((v, i) => (
                        <span key={i} className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-300">
                          {v.description} ({v.date.split('-').reverse().slice(0, 2).join('/')}) - <strong>R$ {v.amount}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Balance */}
                <div className="bg-slate-900 p-5 border border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Saldo de Contas</p>
                    <p className="text-2xl font-black font-display text-white">
                      R$ {kpis.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block animate-pulse"></span>
                      Saldos reais consolidados
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-950/30 text-teal-400 border border-teal-900/40">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 2: Inflow */}
                <div className="bg-slate-900 p-5 border border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Receitas no Mês</p>
                    <p className="text-2xl font-black font-display text-white">
                      R$ {kpis.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5 inline" /> Entradas ativas
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 text-emerald-400 border border-emerald-900/40">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 3: Outflow */}
                <div className="bg-slate-900 p-5 border border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Despesas no Mês</p>
                    <p className="text-2xl font-black font-display text-white">
                      R$ {kpis.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-rose-400 font-mono flex items-center gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5 inline" /> Saídas consolidadas
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/30 text-rose-400 border border-rose-900/40">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 4: Net Saving */}
                <div className="bg-slate-900 p-5 border border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Economia Líquida</p>
                    <p className={`text-2xl font-black font-display ${kpis.economy >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                      R$ {kpis.economy.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Taxa poupança: {kpis.income > 0 ? Math.round((kpis.economy / kpis.income) * 100) : 0}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${kpis.economy >= 0 ? 'bg-teal-950/30 text-teal-400 border-teal-900/40' : 'bg-rose-950/30 text-rose-400 border-rose-900/40'}`}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Dynamic AI Advisor & Quick Logger row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Dynamic AI Advisor Box with Context Heuristics */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/25 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-10">
                    <BrainCircuit className="w-20 h-20 text-teal-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-teal-400">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider">Insight Rápido do Mentor IA</h3>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850/60 text-xs text-slate-300 space-y-2">
                      <p className="font-semibold text-white flex items-center gap-1">
                        🤖 Diagnóstico Atual ({months.find(m => m.value === activeMonth)?.label}):
                      </p>
                      <p className="leading-relaxed">
                        {kpis.economy >= 0 ? (
                          `Parabéns, ${userName.split(' ')[0]}! Você economizou R$ ${kpis.economy.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} neste mês (${kpis.income > 0 ? Math.round((kpis.economy / kpis.income) * 100) : 0}% das entradas). Seus gastos com alimentação representam a maior fatia de consumo.`
                        ) : (
                          `Atenção, ${userName.split(' ')[0]}! Suas despesas excederam suas receitas em R$ ${Math.abs(kpis.economy).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}. Considere revisar compras parceladas e serviços por assinatura inativos.`
                        )}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-relaxed pl-1">
                      💡 <strong>Dica da IA:</strong> Seu patrimônio líquido total está em R$ {cockpitStats.patrimonioTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}. Focar em investir {kpis.income > 0 ? Math.round(kpis.income * 0.1) : 100} reais adicionais este mês acelerará sua meta de <em>{goals[0]?.name || 'Reserva de Emergência'}</em> em 3 meses!
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">Motor de Heurísticas v1.4</span>
                    <button 
                      onClick={() => setActiveScreen('ai_coach')}
                      className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-lg shadow transition-all cursor-pointer flex items-center gap-1"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" /> Conversar com Mentor IA
                    </button>
                  </div>
                </div>

                {/* 2. Seamless Quick Expense Logger Widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Plus className="w-4 h-4 text-teal-400" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider">Lançamento Expresso de Gastos</h3>
                    </div>

                    <QuickExpenseLoggerWidget 
                      accounts={accounts} 
                      onAddTransaction={(desc, val, cat, accId) => {
                        const newTxn: Transaction = {
                          id: `txn_${Math.random().toString(36).substring(2, 9)}`,
                          description: desc,
                          amount: parseFloat(val),
                          type: 'DESPESA',
                          category: cat,
                          subcategory: 'Lançamento Rápido',
                          accountId: accId,
                          paymentMethod: 'PIX',
                          date: new Date().toISOString().substring(0, 10),
                          time: new Date().toTimeString().substring(0, 5),
                          status: 'PAGO'
                        };
                        handleAddTransaction(newTxn);
                      }} 
                    />
                  </div>
                </div>

              </div>

              {/* Transactions list & Categories split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left (2 cols): Transaction entries */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-white font-display">Lançamentos Registrados</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Visão resumida das movimentações de {months.find(m => m.value === activeMonth)?.label}</p>
                      </div>

                      <button
                        onClick={() => setActiveScreen('novo_lancamento')}
                        className="flex items-center gap-1 px-3 py-2 bg-teal-500 text-slate-950 hover:opacity-90 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> Novo Lançamento
                      </button>
                    </div>

                    <div className="divide-y divide-slate-850 max-h-[380px] overflow-y-auto pr-1">
                      {activeTransactions.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 space-y-2">
                          <Sliders className="w-8 h-8 mx-auto" />
                          <p className="text-xs font-bold">Nenhum lançamento no período ativo.</p>
                          <p className="text-[10px]">Utilize o botão acima para cadastrar novos lançamentos de teste.</p>
                        </div>
                      ) : (
                        activeTransactions.map((t) => (
                          <div 
                            key={t.id} 
                            onClick={() => handleTriggerEditScreen(t.id)}
                            className="py-3 flex items-center justify-between hover:bg-slate-850/20 px-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl border ${
                                t.type === 'RECEITA' 
                                  ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400' 
                                  : 'bg-rose-950/40 border-rose-900/40 text-rose-400'
                              }`}>
                                {t.type === 'RECEITA' ? <Briefcase className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                              </div>

                              <div>
                                <p className="text-xs font-bold text-white">{t.description}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                  <span className="bg-slate-850 px-1.5 py-0.5 rounded text-slate-300 font-semibold">{t.category}</span>
                                  <span>•</span>
                                  <span>{t.date.split('-').reverse().join('/')}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    {t.cardId ? <CardIcon className="w-3 h-3 text-purple-400" /> : <Wallet className="w-3 h-3 text-teal-400" />}
                                    {t.cardId ? 'Crédito' : t.paymentMethod}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className={`text-xs font-bold font-mono ${t.type === 'RECEITA' ? 'text-emerald-400' : 'text-white'}`}>
                                {t.type === 'RECEITA' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <span className="text-[9px] text-teal-400 font-bold bg-teal-950/40 border border-teal-900/30 px-1.5 py-0.2 rounded inline-block mt-0.5">
                                Sheets Sync
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Connected bank portfolios */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-xs text-slate-400 tracking-wide uppercase">Contas Bancárias & Saldos</h3>
                      <button onClick={() => setActiveScreen('contas')} className="text-xs text-teal-400 hover:underline">Ver tudo</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {accounts.map(a => (
                        <div key={a.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{a.name}</p>
                          <p className="text-sm font-black font-mono text-white">R$ {a.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right sidebar inside dashboard: category spendings and active target metrics */}
                <div className="space-y-4">
                  {/* Category distribution */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Despesas por Categoria</h3>
                      <button onClick={() => setActiveScreen('categorias')} className="text-xs text-teal-400 hover:underline">Limites</button>
                    </div>

                    {categoryStats.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        Sem despesas no período selecionado.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categoryStats.map(stat => (
                          <div key={stat.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-300 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${stat.color} inline-block`}></span>
                                {stat.name}
                              </span>
                              <span className="text-white font-bold font-mono">
                                R$ {stat.value.toLocaleString('pt-BR')} ({stat.percentage}%)
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-950 border border-slate-850 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${stat.color}`} 
                                style={{ width: `${stat.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Goals card banner */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Metas de Poupança</h3>
                      <button onClick={() => setActiveScreen('metas')} className="text-xs text-teal-400 hover:underline">Aportar</button>
                    </div>

                    <div className="space-y-3">
                      {goals.slice(0, 2).map(g => {
                        const completion = Math.round((g.currentAmount / g.targetAmount) * 100);
                        return (
                          <div key={g.id} className="space-y-1.5">
                            <div className="flex justify-between items-start text-xs">
                              <span className="font-bold text-white">{g.name}</span>
                              <span className="text-teal-400 font-bold font-mono">{completion}%</span>
                            </div>
                            <div className="w-full bg-slate-950 border border-slate-850 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-teal-500 h-full rounded-full"
                                style={{ width: `${completion}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Screen: Centro Financeiro (Point 6 & 7) */}
          {activeScreen === 'centro_financeiro' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                    <Activity className="w-3.5 h-3.5 text-purple-400" /> Hub de Saúde & Consolidado
                  </div>
                  <h2 className="text-xl font-black text-white font-display mt-0.5">Centro Financeiro Unificado</h2>
                  <p className="text-xs text-slate-400">Patrimônio, limites de crédito, assinaturas fixas e diagnósticos de saúde em um só lugar</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">Modo de Exibição:</span>
                  <span className="px-2.5 py-1 bg-teal-950/40 text-teal-400 border border-teal-900/40 rounded-lg text-xs font-mono font-bold">
                    {isFamilyMode ? 'Família Consolidado' : 'Pessoal Cristiano'}
                  </span>
                </div>
              </div>

              {/* Point 7: Painel de Saúde Financeira */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                      <Award className="w-5 h-5 text-amber-400" /> Diagnóstico de Saúde Financeira
                    </h3>
                    <p className="text-[11px] text-slate-500">Métricas avaliadas automaticamente pelo Copiloto IA</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-900/40 rounded-full">
                    <span className="w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-400 font-mono">SAÚDE: EXCELENTE (88/100)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Metric 1 */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Fundo de Emergência</span>
                    <div className="text-sm font-bold text-white">6.1 Meses Cobertos</div>
                    <div className="flex text-amber-400 text-xs font-mono">★★★★★</div>
                    <p className="text-[10px] text-slate-500">Meta recomendada: 6 meses</p>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Endividamento</span>
                    <div className="text-sm font-bold text-white">32% da Renda Comprometida</div>
                    <div className="flex text-amber-400 text-xs font-mono">★★★★☆</div>
                    <p className="text-[10px] text-slate-500">Ideal: abaixo de 35%</p>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Taxa de Poupança</span>
                    <div className="text-sm font-bold text-white">19.4% Poupados este Mês</div>
                    <div className="flex text-amber-400 text-xs font-mono">★★★★★</div>
                    <p className="text-[10px] text-slate-500">Ideal: acima de 15%</p>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Contas Regulares</span>
                    <div className="text-sm font-bold text-white">Atrasos de Pagamento: 0</div>
                    <div className="flex text-amber-400 text-xs font-mono">★★★★★</div>
                    <p className="text-[10px] text-slate-500">Score de pontualidade ideal</p>
                  </div>
                </div>
              </div>

              {/* Grid: Accounts & Cards on left (8 cols), SaaS Subscriptions & Goals on right (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: Banks & Cards (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Bank Accounts Section */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                      <h3 className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-teal-400" /> Contas e Saldos Bancários
                      </h3>
                      <button 
                        onClick={() => setActiveScreen('contas')}
                        className="text-[10px] text-teal-400 font-bold hover:underline"
                      >
                        Nova Conta +
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {accounts.map(acc => (
                        <div key={acc.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{acc.name}</p>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded text-slate-500 font-mono font-medium uppercase">{acc.type}</span>
                          </div>
                          <span className="text-xs font-black font-mono text-emerald-400 shrink-0">
                            R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credit Cards Limits Section */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                      <h3 className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CardIcon className="w-4 h-4 text-purple-400" /> Cartões de Crédito & Limites
                      </h3>
                      <button 
                        onClick={() => setActiveScreen('cartoes')}
                        className="text-[10px] text-teal-400 font-bold hover:underline"
                      >
                        Novo Cartão +
                      </button>
                    </div>

                    <div className="space-y-4">
                      {cards.map(card => {
                        const percentUsed = Math.min(100, Math.round((card.usedLimit / card.limit) * 100));
                        return (
                          <div key={card.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <p className="text-xs font-bold text-white">{card.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Vencimento Dia {card.invoiceDueDay} • Fechamento Dia {card.invoiceClosingDay}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-rose-400 font-mono">Usado: R$ {card.usedLimit.toLocaleString('pt-BR')}</p>
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Limite: R$ {card.limit.toLocaleString('pt-BR')}</p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full" 
                                  style={{ width: `${percentUsed}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                                <span>{percentUsed}% Utilizado</span>
                                <span className="text-teal-400">R$ {card.availableLimit.toLocaleString('pt-BR')} Disponíveis</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* RIGHT: Subscriptions & Goals (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* SaaS Recurrent subscriptions cost */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                      <h3 className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-400" /> Assinaturas & Recorrências
                      </h3>
                      <span className="text-[10px] bg-purple-950 text-purple-400 px-1.5 rounded font-bold font-mono">
                        R$ {subscriptions.reduce((sum, s) => sum + (s.active ? s.amount : 0), 0).toFixed(2)}/mês
                      </span>
                    </div>

                    <div className="space-y-2">
                      {subscriptions.map(sub => (
                        <div key={sub.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{sub.logo}</span>
                            <div>
                              <p className="font-bold text-white">{sub.name}</p>
                              <p className="text-[10px] text-slate-500">Vence dia {sub.dueDate}</p>
                            </div>
                          </div>
                          <strong className="text-slate-300 font-mono">R$ {sub.amount.toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Savings Goals */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                      <h3 className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-4 h-4 text-teal-400" /> Metas de Poupança Ativas
                      </h3>
                      <button 
                        onClick={() => setActiveScreen('metas')}
                        className="text-[10px] text-teal-400 font-bold hover:underline"
                      >
                        Nova Meta +
                      </button>
                    </div>

                    <div className="space-y-3">
                      {goals.map(goal => {
                        const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                        return (
                          <div key={goal.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="text-xs font-bold text-white">{goal.name}</p>
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Alvo: R$ {goal.targetAmount.toLocaleString('pt-BR')}</p>
                              </div>
                              <span className="text-[10px] font-black text-teal-400 font-mono">{percent}%</span>
                            </div>

                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${percent}%` }} />
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>Acumulado: R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Group 2: Transaction screens (Receitas, Despesas, Novo Lançamento, Editar Lançamento) (6-9) */}
          {['receitas', 'despesas', 'novo_lancamento', 'editar_lancamento'].includes(activeScreen) && (
            <TransactionScreens 
              currentScreen={activeScreen as any}
              setScreen={setActiveScreen as any}
              transactions={transactions}
              accounts={accounts}
              cards={cards}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              editingTransactionId={editingTransactionId}
              setEditingTransactionId={setEditingTransactionId}
            />
          )}

          {/* Group 3: Organization screens (Categorias, Contas, Cartões) (10-12) */}
          {['categorias', 'contas', 'cartoes'].includes(activeScreen) && (
            <OrganizationScreens 
              currentScreen={activeScreen as any}
              setScreen={setActiveScreen as any}
              accounts={accounts}
              cards={cards}
              transactions={transactions}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onUpdateCardLimit={handleUpdateCardLimit}
            />
          )}

          {/* Group 4: Planning screens (Parcelamentos, Assinaturas, Metas) (13-15) */}
          {['parcelamentos', 'assinaturas', 'metas'].includes(activeScreen) && (
            <PlanningScreens 
              currentScreen={activeScreen as any}
              setScreen={setActiveScreen as any}
              goals={goals}
              subscriptions={subscriptions}
              transactions={transactions}
              cards={cards}
              onAddGoal={handleAddGoal}
              onAddSubscription={handleAddSubscription}
              onDepositToGoal={handleDepositToGoal}
            />
          )}

          {/* Group 5: Analysis screens (Investimentos, Calendário, Relatórios) (16-18) */}
          {['investimentos', 'calendario', 'relatorios'].includes(activeScreen) && (
            <AnalysisScreens 
              currentScreen={activeScreen as any}
              setScreen={setActiveScreen as any}
              transactions={transactions}
              investments={investments}
              onAddInvestment={handleAddInvestment}
            />
          )}

          {/* Group 6: System Screens (Perfil, Configurações, Backup, Sobre, Notificações) (19-23) */}
          {['perfil', 'configuracoes', 'backup', 'sobre', 'notificacoes'].includes(activeScreen) && (
            <SystemScreens 
              currentScreen={activeScreen as any}
              setScreen={setActiveScreen as any}
              userName={userName}
              setUserName={(newName) => {
                if (currentUser) {
                  const updated = { ...currentUser, name: newName };
                  setCurrentUser(updated);
                  setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
                }
              }}
              userEmail={userEmail}
              setUserEmail={(newEmail) => {
                if (currentUser) {
                  const updated = { ...currentUser, email: newEmail };
                  setCurrentUser(updated);
                  setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
                }
              }}
              onLogout={() => {
                setCurrentUser(null);
                setActiveScreen('login');
              }}
              onResetDatabase={handleResetDatabase}
              sheetsUrl={sheetsUrl}
              setSheetsUrl={setSheetsUrl}
              isLoadingSheets={isLoadingSheets}
              syncFromSheets={syncFromSheets}
              sheetsError={sheetsError}
            />
          )}

          {/* Group 7: Search Screens (Pesquisa Global, Filtros Avançados) (24-25) */}
          {['pesquisa', 'filtros'].includes(activeScreen) && (
            <SearchScreens 
              currentScreen={activeScreen as any}
              setScreen={setActiveScreen as any}
              transactions={transactions}
              accounts={accounts}
              cards={cards}
              onTriggerEditScreen={handleTriggerEditScreen}
            />
          )}

          {/* Group 8: Financial AI Coach Screen (20) */}
          {activeScreen === 'ai_coach' && (
            <AiCoachScreen 
              userName={userName}
              activeMonth={activeMonth}
              transactions={transactions}
              accounts={accounts}
              cards={cards}
              goals={goals}
              subscriptions={subscriptions}
              investments={investments}
            />
          )}

          {/* Group 9: Split Expenses Screen (Divisão Ale & Cris) */}
          {activeScreen === 'divisao_contas' && (
            <SplitExpensesScreen 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              activeMonth={activeMonth}
            />
          )}

          {/* Group 10: Admin User Management Screen */}
          {activeScreen === 'usuarios' && (
            <UserManagementScreen 
              users={users}
              currentUserEmail={userEmail}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUser={handleUpdateUser}
            />
          )}

          </PhoneEmulatorWrapper>
        </div>
      </main>

      {/* Globally Available Floating AI Chat Copilot (Point 8) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Floating Bubble Button (When closed) */}
        {!isAiChatOpen && (
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-bounce"
            id="floating-ai-bubble"
          >
            <BrainCircuit className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold font-mono">Falar com Copiloto IA</span>
          </button>
        )}

        {/* Floating Chat Box (When open) */}
        {isAiChatOpen && (
          <div 
            className="w-[360px] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300"
            id="floating-ai-card"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-900/50 flex items-center justify-center text-teal-400">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-display">Copiloto Financeiro IA</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] text-emerald-400 font-mono">Pronto para te guiar</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsAiChatOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20">
              {floatingMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none shadow-md' 
                        : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-850'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[8px] opacity-60 text-right mt-1 font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {isFloatingSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
                    <span>Analisando suas finanças...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick action chips */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-850 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              <button 
                onClick={() => handleSendFloatingMessage('Qual é a previsão de saldo para o fim do mês?')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] font-medium rounded-lg border border-slate-850 shrink-0 cursor-pointer transition-all"
              >
                🔮 Previsão de Saldo
              </button>
              <button 
                onClick={() => handleSendFloatingMessage('Dicas de IA para economizar no cartão')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] font-medium rounded-lg border border-slate-850 shrink-0 cursor-pointer transition-all"
              >
                💳 Economizar Cartão
              </button>
              <button 
                onClick={() => handleSendFloatingMessage('Como está minha reserva de emergência?')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] font-medium rounded-lg border border-slate-850 shrink-0 cursor-pointer transition-all"
              >
                🛡️ Fundo Emergência
              </button>
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFloatingMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-850 flex items-center gap-2"
            >
              <input
                type="text"
                value={floatingInput}
                onChange={(e) => setFloatingInput(e.target.value)}
                placeholder="Pergunte ao seu Copiloto IA..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                disabled={isFloatingSending}
              />
              <button
                type="submit"
                disabled={!floatingInput.trim() || isFloatingSending}
                className="p-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-slate-950 rounded-xl transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
