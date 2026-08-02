/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Transaction, 
  BankAccount, 
  CreditCard, 
  FinancialGoal, 
  Subscription, 
  Investment, 
  InstallmentContract, 
  InstallmentParcel,
  FinancialStatus,
  FinancialObligation
} from '../types';

export interface CalendarEventItem {
  id: string;
  title: string;
  amount: number;
  type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'INVESTIMENTO';
  status: FinancialStatus;
  category: string;
  sourceEntity: 'TRANSACTION' | 'INSTALLMENT' | 'SUBSCRIPTION' | 'CARD_INVOICE' | 'GOAL';
  date: string;
  cardName?: string;
}

export interface TimelineNodeItem {
  id: string;
  date: string;
  dateStr: string;
  title: string;
  amount: number; // positive for inflow, negative for outflow
  type: 'BASE' | 'ENTRADA' | 'SAIDA';
  cat: string;
  isIncluded: boolean;
  runningBalance: number;
  sourceEntity: string;
}

export interface CardInvoiceDetail {
  cardId: string;
  cardName: string;
  bankName: string;
  limit: number;
  openInvoiceAmount: number;
  closedInvoiceAmount: number;
  usedLimit: number;
  availableLimit: number;
  closingDate: string;
  dueDate: string;
  bestPurchaseDay: number;
  status: 'ABERTA' | 'FECHADA' | 'PAGA' | 'ATRASADA';
  items: {
    description: string;
    amount: number;
    date: string;
    category: string;
  }[];
}

export interface MonthlySummaryResult {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyInvested: number;
  economy: number;
  savingsRate: number;
  budgetLimit: number;
  percentUtilized: number;
  quantoPodeGastar: number;
  categoryStats: {
    category: string;
    amount: number;
    percentage: number;
    limit: number;
  }[];
}

export interface UpcomingBillItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  status: FinancialStatus;
  source: string;
}

// Helper to calculate date by adding N months
export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const parts = dateStr.split('-');
  let year = parseInt(parts[0], 10) || 2026;
  let month = parseInt(parts[1], 10) || 8;
  const day = parseInt(parts[2], 10) || 1;
  
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
  
  let targetDay = day;
  const maxDaysInMonth = new Date(year, month, 0).getDate();
  if (targetDay > maxDaysInMonth) {
    targetDay = maxDaysInMonth;
  }
  const dayStr = targetDay < 10 ? `0${targetDay}` : targetDay.toString();
  
  return `${yearStr}-${monthStr}-${dayStr}`;
}

export class FinancialEngine {

  /**
   * 0. Lifecycle Status Resolver:
   * Maps an obligation/occurrence date and payment condition to its exact domain state:
   * PREVISTA -> A_VENCER -> VENCE_HOJE -> PAGA -> ATRASADA -> CANCELADA
   */
  static determineStatus(
    dueDateStr: string,
    isPaid: boolean,
    isCancelled: boolean = false,
    todayStr: string = '2026-08-02'
  ): FinancialStatus {
    if (isCancelled) return 'CANCELADA';
    if (isPaid) return 'PAGA';

    if (dueDateStr < todayStr) return 'ATRASADA';
    if (dueDateStr === todayStr) return 'VENCE_HOJE';
    return 'PREVISTA';
  }

  /**
   * 1. Create Single Expense / Income Transaction with strict lifecycle evaluation
   */
  static createExpense(params: {
    description: string;
    amount: number;
    type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'INVESTIMENTO';
    category: string;
    subcategory?: string;
    accountId?: string;
    cardId?: string;
    paymentMethod: 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TED';
    date: string;
    time?: string;
    notes?: string;
    attachmentName?: string;
    isPaidImmediately: boolean;
    tags?: string[];
    location?: string;
    relatedPerson?: string;
    isFavorite?: boolean;
    todayStr?: string;
  }): { transaction: Transaction; updatedAccount?: BankAccount } {
    const today = params.todayStr || '2026-08-02';
    const status = this.determineStatus(params.date, params.isPaidImmediately, false, today);

    const transaction: Transaction = {
      id: `txn_${Math.random().toString(36).substring(2, 9)}`,
      description: params.description,
      amount: params.amount,
      type: params.type,
      category: params.category,
      subcategory: params.subcategory || 'Geral',
      accountId: params.paymentMethod === 'CREDITO' ? '' : (params.accountId || ''),
      cardId: params.paymentMethod === 'CREDITO' ? params.cardId : undefined,
      paymentMethod: params.paymentMethod,
      date: params.date,
      time: params.time || '12:00',
      notes: params.notes,
      attachmentName: params.attachmentName,
      status,
      paidAt: params.isPaidImmediately ? params.date : undefined,
      paidAmount: params.isPaidImmediately ? params.amount : undefined,
      tags: params.tags,
      location: params.location,
      relatedPerson: params.relatedPerson,
      isFavorite: params.isFavorite || false,
      recurrent: false
    };

    return { transaction };
  }

  /**
   * 2. Create Recurring Expense (Motor de Recorrência)
   * Generates competence occurrences across months.
   * Month 1 is marked as PAGA ONLY if isPaidImmediatelyFirst is true.
   * Future months (2..N) ALWAYS start as PREVISTA / calculated status.
   */
  static createRecurringExpense(params: {
    description: string;
    amount: number;
    type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'INVESTIMENTO';
    category: string;
    subcategory?: string;
    accountId?: string;
    cardId?: string;
    paymentMethod: 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TED';
    startDate: string;
    months: number;
    time?: string;
    notes?: string;
    isPaidImmediatelyFirst: boolean;
    tags?: string[];
    location?: string;
    relatedPerson?: string;
    isFavorite?: boolean;
    todayStr?: string;
  }): Transaction[] {
    const today = params.todayStr || '2026-08-02';
    const totalMonths = Math.max(1, params.months);
    const obligationId = `oblig_${Math.random().toString(36).substring(2, 9)}`;
    const result: Transaction[] = [];

    for (let i = 0; i < totalMonths; i++) {
      const occurrenceDate = addMonthsToDate(params.startDate, i);
      const isFirst = i === 0;
      const isPaid = isFirst ? params.isPaidImmediatelyFirst : false;
      const status = this.determineStatus(occurrenceDate, isPaid, false, today);

      const occurrenceDesc = `${params.description} (${i + 1}/${totalMonths})`;
      const occurrenceNotes = params.notes
        ? `${params.notes} - Competência ${i + 1}/${totalMonths}`
        : `Recorrência mensal - Competência ${i + 1}/${totalMonths}`;

      result.push({
        id: `txn_rec_${Math.random().toString(36).substring(2, 9)}_${i}`,
        obligationId,
        description: occurrenceDesc,
        amount: params.amount,
        type: params.type,
        category: params.category,
        subcategory: params.subcategory || 'Geral',
        accountId: params.paymentMethod === 'CREDITO' ? '' : (params.accountId || ''),
        cardId: params.paymentMethod === 'CREDITO' ? params.cardId : undefined,
        paymentMethod: params.paymentMethod,
        date: occurrenceDate,
        time: params.time || '12:00',
        notes: occurrenceNotes,
        status,
        paidAt: isPaid ? occurrenceDate : undefined,
        paidAmount: isPaid ? params.amount : undefined,
        installmentNumber: i + 1,
        totalInstallments: totalMonths,
        tags: params.tags,
        location: params.location,
        relatedPerson: params.relatedPerson,
        isFavorite: params.isFavorite || false,
        recurrent: true
      });
    }

    return result;
  }

  /**
   * 3. Create Installment Contract & Explicit Parcels (Motor de Parcelamento)
   * Each parcel is a distinct entity with its own competence, status, due date, payment, value.
   */
  static createInstallmentContract(params: {
    item: string;
    totalAmount: number;
    totalParcels: number;
    cardName?: string;
    cardId?: string;
    accountId?: string;
    category?: string;
    startDate?: string;
    todayStr?: string;
  }): { contract: InstallmentContract; parcels: InstallmentParcel[] } {
    const today = params.todayStr || '2026-08-02';
    const totalParcels = Math.max(1, params.totalParcels);
    const parcelValue = parseFloat((params.totalAmount / totalParcels).toFixed(2));
    const contractId = `ins_${Math.random().toString(36).substring(2, 9)}`;
    const baseDate = params.startDate || today;

    const contract: InstallmentContract = {
      id: contractId,
      item: params.item,
      totalAmount: params.totalAmount,
      parcelValue,
      currentParcel: 1,
      totalParcels,
      cardName: params.cardName || 'Cartão de Crédito',
      startDate: baseDate,
      accountId: params.accountId,
      cardId: params.cardId,
      category: params.category || 'Parcelamentos'
    };

    const parcels: InstallmentParcel[] = [];
    for (let p = 1; p <= totalParcels; p++) {
      const dueDate = addMonthsToDate(baseDate, p - 1);
      const isPaid = false; // Parcela nasce prevista / a vencer
      const status = this.determineStatus(dueDate, isPaid, false, today);

      parcels.push({
        id: `${contractId}_p${p}`,
        contractId,
        item: params.item,
        parcelNumber: p,
        totalParcels,
        parcelValue,
        dueDate,
        status,
        cardName: params.cardName || 'Cartão de Crédito'
      });
    }

    return { contract, parcels };
  }

  /**
   * 4. Pay / Settle a Transaction or Occurrence (Registrar Liquidação)
   */
  static payExpense(
    transaction: Transaction,
    paymentDate: string = '2026-08-02',
    accountId?: string,
    accounts: BankAccount[] = []
  ): { updatedTransaction: Transaction; updatedAccounts: BankAccount[] } {
    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'PAGA',
      paidAt: paymentDate,
      paidAmount: transaction.amount,
      accountId: accountId || transaction.accountId
    };

    const targetAccId = accountId || transaction.accountId;
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === targetAccId) {
        let newBalance = acc.balance;
        if (transaction.type === 'RECEITA') {
          newBalance += transaction.amount;
        } else if (transaction.type === 'DESPESA') {
          newBalance -= transaction.amount;
        }
        return { ...acc, balance: Math.max(0, parseFloat(newBalance.toFixed(2))) };
      }
      return acc;
    });

    return { updatedTransaction, updatedAccounts };
  }

  /**
   * 5. Cancel Expense / Transaction
   */
  static cancelExpense(transaction: Transaction): Transaction {
    return {
      ...transaction,
      status: 'CANCELADA'
    };
  }

  /**
   * 6. Calculate Current Liquid Balance across all Bank Accounts
   */
  static calculateCurrentBalance(accounts: BankAccount[]): number {
    if (!accounts || accounts.length === 0) return 0;
    return accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  }

  /**
   * 7. Calculate Total Investments Current Value
   */
  static calculateTotalInvestments(investments: Investment[]): number {
    if (!investments || investments.length === 0) return 0;
    return investments.reduce((acc, i) => acc + (i.currentAmount || i.investedAmount || 0), 0);
  }

  /**
   * 8. Calculate Total Credit Card & Installment Debt
   */
  static calculateTotalCardDebt(
    cards: CreditCard[], 
    transactions: Transaction[], 
    installments: InstallmentContract[]
  ): number {
    let total = 0;

    // Card unpaid transactions
    if (transactions) {
      transactions.forEach(t => {
        if (t.cardId && t.type === 'DESPESA' && t.status !== 'PAGA' && t.status !== 'PAGO' && t.status !== 'CANCELADA') {
          total += t.amount;
        }
      });
    }

    // Remaining installment contracts debt
    if (installments) {
      installments.forEach(inst => {
        const remainingParcels = Math.max(0, inst.totalParcels - inst.currentParcel);
        total += remainingParcels * inst.parcelValue;
      });
    }

    return total;
  }

  /**
   * 9. Calculate Net Worth (Patrimônio Líquido)
   */
  static calculateNetWorth(
    accounts: BankAccount[], 
    investments: Investment[], 
    cards: CreditCard[], 
    transactions: Transaction[], 
    installments: InstallmentContract[]
  ): number {
    const balance = this.calculateCurrentBalance(accounts);
    const invTotal = this.calculateTotalInvestments(investments);
    const cardDebt = this.calculateTotalCardDebt(cards, transactions, installments);
    return balance + invTotal - cardDebt;
  }

  /**
   * 10. Expand Installment Contracts into explicit Monthly Parcels
   */
  static expandInstallments(installments: InstallmentContract[], todayStr: string = '2026-08-02'): InstallmentParcel[] {
    const result: InstallmentParcel[] = [];
    if (!installments || installments.length === 0) return result;

    installments.forEach(inst => {
      const baseDate = inst.startDate || '2026-08-10';
      for (let p = 1; p <= inst.totalParcels; p++) {
        const dueDate = addMonthsToDate(baseDate, p - 1);
        const isPaid = p <= inst.currentParcel;
        const status = this.determineStatus(dueDate, isPaid, false, todayStr);

        result.push({
          id: `${inst.id}_p${p}`,
          contractId: inst.id,
          item: inst.item,
          parcelNumber: p,
          totalParcels: inst.totalParcels,
          parcelValue: inst.parcelValue,
          dueDate,
          status,
          cardName: inst.cardName || 'Cartão de Crédito'
        });
      }
    });

    return result;
  }

  /**
   * 11. Calculate Monthly Summary (KPIs, Expenses by Category, Budget Limits)
   */
  static calculateMonthlySummary(
    activeMonth: string,
    transactions: Transaction[],
    accounts: BankAccount[],
    cards: CreditCard[],
    installments: InstallmentContract[],
    subscriptions: Subscription[],
    goals: FinancialGoal[],
    categoryLimits: Record<string, number> = {}
  ): MonthlySummaryResult {
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let monthlyInvested = 0;
    const catMap: Record<string, number> = {};

    // 1. Direct transactions in activeMonth (excluding CANCELADA)
    const monthTxns = (transactions || []).filter(t => t.date && t.date.startsWith(activeMonth) && t.status !== 'CANCELADA');
    monthTxns.forEach(t => {
      if (t.type === 'RECEITA') {
        monthlyIncome += t.amount;
      } else if (t.type === 'DESPESA') {
        monthlyExpense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      } else if (t.type === 'INVESTIMENTO') {
        monthlyInvested += t.amount;
      }
    });

    // 2. Add active subscriptions for activeMonth
    (subscriptions || []).forEach(sub => {
      if (sub.active) {
        monthlyExpense += sub.amount;
        catMap[sub.category || 'Assinaturas'] = (catMap[sub.category || 'Assinaturas'] || 0) + sub.amount;
      }
    });

    // 3. Add installment parcels due in activeMonth
    const expandedParcels = this.expandInstallments(installments);
    expandedParcels.filter(p => p.dueDate.startsWith(activeMonth) && p.status !== 'CANCELADA').forEach(p => {
      monthlyExpense += p.parcelValue;
      catMap['Parcelamentos'] = (catMap['Parcelamentos'] || 0) + p.parcelValue;
    });

    // Category limits sum
    const totalCategoryLimitsSum = Object.values(categoryLimits || {}).reduce<number>((acc, l) => acc + (l || 0), 0);
    const budgetLimit = totalCategoryLimitsSum > 0 ? totalCategoryLimitsSum : (monthlyIncome > 0 ? monthlyIncome : 5000);
    const percentUtilized = budgetLimit > 0 ? Math.min(100, Math.round((monthlyExpense / budgetLimit) * 100)) : 0;
    const quantoPodeGastar = Math.max(0, budgetLimit - monthlyExpense);
    const economy = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0;

    // Build category stats array
    const categoryStats = Object.keys(catMap).map(cat => {
      const amount = catMap[cat];
      const percentage = monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0;
      const limit = categoryLimits[cat] || 0;
      return { category: cat, amount, percentage, limit };
    }).sort((a, b) => b.amount - a.amount);

    return {
      monthlyIncome,
      monthlyExpense,
      monthlyInvested,
      economy,
      savingsRate,
      budgetLimit,
      percentUtilized,
      quantoPodeGastar,
      categoryStats
    };
  }

  /**
   * 12. Calculate Upcoming Bills & Due Dates with strict lifecycle statuses
   */
  static calculateUpcomingBills(
    todayDateStr: string = '2026-08-02',
    transactions: Transaction[] = [],
    subscriptions: Subscription[] = [],
    installments: InstallmentContract[] = []
  ) {
    const list: UpcomingBillItem[] = [];

    // 1. Unpaid Transactions (excluding PAGA, PAGO, CANCELADA)
    (transactions || []).filter(t => t.status !== 'PAGA' && t.status !== 'PAGO' && t.status !== 'CANCELADA').forEach(t => {
      const status = this.determineStatus(t.date, false, false, todayDateStr);

      list.push({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type === 'RECEITA' ? 'RECEITA' : 'DESPESA',
        category: t.category,
        status,
        source: 'Lançamento'
      });
    });

    // 2. Active Subscriptions
    (subscriptions || []).filter(s => s.active).forEach(s => {
      const dayStr = s.dueDate < 10 ? `0${s.dueDate}` : `${s.dueDate}`;
      const dueDate = `2026-08-${dayStr}`;
      const status = this.determineStatus(dueDate, false, false, todayDateStr);

      list.push({
        id: `sub_bill_${s.id}`,
        description: s.name,
        amount: s.amount,
        date: dueDate,
        type: 'DESPESA',
        category: s.category || 'Assinatura',
        status,
        source: 'Assinatura'
      });
    });

    // 3. Installments parcels unpaid
    const parcels = this.expandInstallments(installments, todayDateStr);
    parcels.filter(p => p.status !== 'PAGA' && p.status !== 'PAGO' && p.status !== 'CANCELADA').forEach(p => {
      list.push({
        id: p.id,
        description: `${p.item} (${p.parcelNumber}/${p.totalParcels}x)`,
        amount: p.parcelValue,
        date: p.dueDate,
        type: 'DESPESA',
        category: 'Parcelamento',
        status: p.status,
        source: 'Parcelamento'
      });
    });

    // Sort by date asc
    list.sort((a, b) => a.date.localeCompare(b.date));

    const contasVencidas = list.filter(i => i.status === 'ATRASADA');
    const contasVenceHoje = list.filter(i => i.status === 'VENCE_HOJE');

    return {
      allBills: list,
      contasVencidasCount: contasVencidas.length,
      contasVencidasAmount: contasVencidas.reduce((a, c) => a + c.amount, 0),
      contasVenceHojeCount: contasVenceHoje.length,
      contasVenceHojeAmount: contasVenceHoje.reduce((a, c) => a + c.amount, 0),
      proximosVencimentosList: list.slice(0, 8)
    };
  }

  /**
   * 13. Credit Card Invoices Engine
   */
  static calculateCardInvoices(
    cards: CreditCard[],
    transactions: Transaction[],
    installments: InstallmentContract[],
    activeMonth: string = '2026-08'
  ): CardInvoiceDetail[] {
    if (!cards || cards.length === 0) return [];

    const expandedParcels = this.expandInstallments(installments);

    return cards.map(card => {
      const cardTxns = (transactions || []).filter(t => t.cardId === card.id || (t.description && t.description.toLowerCase().includes(card.name.toLowerCase())));
      const cardParcels = expandedParcels.filter(p => p.cardName && p.cardName.toLowerCase().includes(card.name.toLowerCase()));

      let openInvoiceAmount = 0;
      let closedInvoiceAmount = 0;
      const items: CardInvoiceDetail['items'] = [];

      // Transactions
      cardTxns.forEach(t => {
        if (t.type === 'DESPESA' && t.status !== 'CANCELADA') {
          if (t.date.startsWith(activeMonth)) {
            openInvoiceAmount += t.amount;
          } else if (t.date < activeMonth && t.status !== 'PAGA' && t.status !== 'PAGO') {
            closedInvoiceAmount += t.amount;
          }
          items.push({
            description: t.description,
            amount: t.amount,
            date: t.date,
            category: t.category
          });
        }
      });

      // Installment parcels
      cardParcels.forEach(p => {
        if (p.status !== 'CANCELADA') {
          if (p.dueDate.startsWith(activeMonth)) {
            openInvoiceAmount += p.parcelValue;
            items.push({
              description: `${p.item} (${p.parcelNumber}/${p.totalParcels}x)`,
              amount: p.parcelValue,
              date: p.dueDate,
              category: 'Parcelamento'
            });
          } else if (p.dueDate < activeMonth && p.status !== 'PAGA' && p.status !== 'PAGO') {
            closedInvoiceAmount += p.parcelValue;
          }
        }
      });

      const usedLimit = openInvoiceAmount + closedInvoiceAmount;
      const availableLimit = Math.max(0, card.limit - usedLimit);

      const closingDayStr = card.invoiceClosingDay < 10 ? `0${card.invoiceClosingDay}` : `${card.invoiceClosingDay}`;
      const dueDayStr = card.invoiceDueDay < 10 ? `0${card.invoiceDueDay}` : `${card.invoiceDueDay}`;

      return {
        cardId: card.id,
        cardName: card.name,
        bankName: card.bankName,
        limit: card.limit,
        openInvoiceAmount,
        closedInvoiceAmount,
        usedLimit,
        availableLimit,
        closingDate: `${activeMonth}-${closingDayStr}`,
        dueDate: `${activeMonth}-${dueDayStr}`,
        bestPurchaseDay: card.bestPurchaseDay,
        status: closedInvoiceAmount > 0 ? 'ATRASADA' : 'ABERTA',
        items
      };
    });
  }

  /**
   * 14. Calendar Events Engine (Filtered strictly by activeMonth)
   * NO MOCK DATA. Returns real database items mapped to days 1..31 of month.
   */
  static getCalendarEvents(
    activeMonth: string = '2026-08',
    transactions: Transaction[] = [],
    installments: InstallmentContract[] = [],
    subscriptions: Subscription[] = []
  ) {
    const year = parseInt(activeMonth.substring(0, 4)) || 2026;
    const month = parseInt(activeMonth.substring(5, 7)) || 8;

    const firstDay = new Date(year, month - 1, 1);
    const emptySpaces = firstDay.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const eventsByDay: Record<number, CalendarEventItem[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      eventsByDay[d] = [];
    }

    // 1. Real Transactions from DB
    (transactions || []).forEach(t => {
      if (t.date && t.date.startsWith(activeMonth) && t.status !== 'CANCELADA') {
        const dayNum = parseInt(t.date.substring(8, 10));
        if (dayNum >= 1 && dayNum <= daysInMonth) {
          eventsByDay[dayNum].push({
            id: t.id,
            title: t.description,
            amount: t.amount,
            type: t.type,
            status: t.status,
            category: t.category,
            sourceEntity: 'TRANSACTION',
            date: t.date
          });
        }
      }
    });

    // 2. Active Subscriptions
    (subscriptions || []).filter(s => s.active).forEach(s => {
      const dayNum = Math.min(s.dueDate, daysInMonth);
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      eventsByDay[dayNum].push({
        id: `sub_cal_${s.id}`,
        title: s.name,
        amount: s.amount,
        type: 'DESPESA',
        status: 'PREVISTA',
        category: s.category || 'Assinatura',
        sourceEntity: 'SUBSCRIPTION',
        date: `${activeMonth}-${dayStr}`
      });
    });

    // 3. Installments
    const parcels = this.expandInstallments(installments);
    parcels.filter(p => p.dueDate.startsWith(activeMonth) && p.status !== 'CANCELADA').forEach(p => {
      const dayNum = parseInt(p.dueDate.substring(8, 10));
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        eventsByDay[dayNum].push({
          id: p.id,
          title: `${p.item} (${p.parcelNumber}/${p.totalParcels}x)`,
          amount: p.parcelValue,
          type: 'DESPESA',
          status: p.status,
          category: 'Parcelamento',
          sourceEntity: 'INSTALLMENT',
          date: p.dueDate,
          cardName: p.cardName
        });
      }
    });

    // Build grid array
    const grid: { day: number; events: CalendarEventItem[] }[] = [];
    for (let i = 0; i < emptySpaces; i++) {
      grid.push({ day: 0, events: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push({ day: d, events: eventsByDay[d] || [] });
    }

    return grid;
  }

  /**
   * 15. Future Cash Flow Timeline Engine
   * Constructs timeline nodes strictly from real database entities
   */
  static getFutureCashFlowTimeline(
    accounts: BankAccount[] = [],
    transactions: Transaction[] = [],
    installments: InstallmentContract[] = [],
    subscriptions: Subscription[] = [],
    activeTimelineIds: string[] = []
  ): TimelineNodeItem[] {
    const baseBalance = this.calculateCurrentBalance(accounts);
    const nodes: TimelineNodeItem[] = [];

    // Node 0: Starting Base
    nodes.push({
      id: 't_base',
      date: 'Hoje',
      dateStr: '2026-08-02',
      title: 'Saldo de Contas Consolidado',
      amount: baseBalance,
      type: 'BASE',
      cat: 'Saldo',
      isIncluded: true,
      runningBalance: baseBalance,
      sourceEntity: 'ACCOUNT'
    });

    // 1. Unpaid Future Transactions
    (transactions || []).filter(t => t.status !== 'PAGA' && t.status !== 'PAGO' && t.status !== 'CANCELADA').forEach(t => {
      const isEntrance = t.type === 'RECEITA';
      nodes.push({
        id: `t_txn_${t.id}`,
        date: t.date ? `${t.date.substring(8, 10)}/${t.date.substring(5, 7)}` : 'Futuro',
        dateStr: t.date || '2026-08-15',
        title: t.description,
        amount: isEntrance ? t.amount : -t.amount,
        type: isEntrance ? 'ENTRADA' : 'SAIDA',
        cat: t.category,
        isIncluded: activeTimelineIds.length === 0 || activeTimelineIds.includes(`t_txn_${t.id}`),
        runningBalance: 0,
        sourceEntity: 'TRANSACTION'
      });
    });

    // 2. Active Subscriptions
    (subscriptions || []).filter(s => s.active).forEach(s => {
      const dayStr = s.dueDate < 10 ? `0${s.dueDate}` : `${s.dueDate}`;
      nodes.push({
        id: `t_sub_${s.id}`,
        date: `${dayStr}/Ago`,
        dateStr: `2026-08-${dayStr}`,
        title: s.name,
        amount: -s.amount,
        type: 'SAIDA',
        cat: s.category || 'Assinatura',
        isIncluded: activeTimelineIds.length === 0 || activeTimelineIds.includes(`t_sub_${s.id}`),
        runningBalance: 0,
        sourceEntity: 'SUBSCRIPTION'
      });
    });

    // 3. Unpaid Installment Parcels
    const parcels = this.expandInstallments(installments);
    parcels.filter(p => p.status !== 'PAGA' && p.status !== 'PAGO' && p.status !== 'CANCELADA').forEach(p => {
      const d = p.dueDate;
      nodes.push({
        id: `t_inst_${p.id}`,
        date: `${d.substring(8, 10)}/${d.substring(5, 7)}`,
        dateStr: d,
        title: `${p.item} (${p.parcelNumber}/${p.totalParcels}x)`,
        amount: -p.parcelValue,
        type: 'SAIDA',
        cat: 'Parcelamento',
        isIncluded: activeTimelineIds.length === 0 || activeTimelineIds.includes(`t_inst_${p.id}`),
        runningBalance: 0,
        sourceEntity: 'INSTALLMENT'
      });
    });

    // Sort by dateStr asc (keep base node first)
    const baseNode = nodes[0];
    const restNodes = nodes.slice(1).sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    let currentSum = baseNode.amount;
    const finalNodes: TimelineNodeItem[] = [baseNode];

    restNodes.forEach(node => {
      const isInc = activeTimelineIds.length === 0 ? true : activeTimelineIds.includes(node.id);
      if (isInc) {
        currentSum += node.amount;
      }
      finalNodes.push({
        ...node,
        isIncluded: isInc,
        runningBalance: currentSum
      });
    });

    return finalNodes;
  }

  /**
   * 16. Historical Cash Flow Data for Reports (Last 6 Months)
   */
  static getHistoricalCashFlow(transactions: Transaction[] = []) {
    const months = ['03', '04', '05', '06', '07', '08'];
    const monthNames = ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];

    return months.map((m, idx) => {
      const prefix = `2026-${m}`;
      let inVal = 0;
      let outVal = 0;

      (transactions || []).filter(t => t.date && t.date.startsWith(prefix) && t.status !== 'CANCELADA').forEach(t => {
        if (t.type === 'RECEITA') inVal += t.amount;
        else if (t.type === 'DESPESA') outVal += t.amount;
      });

      return {
        month: monthNames[idx],
        in: inVal,
        out: outVal
      };
    });
  }

  /**
   * 17. Consolidates AI Coach Summary object
   */
  static getAiCoachSummary(
    userName: string,
    activeMonth: string,
    transactions: Transaction[],
    accounts: BankAccount[],
    cards: CreditCard[],
    goals: FinancialGoal[],
    subscriptions: Subscription[],
    investments: Investment[],
    installments: InstallmentContract[],
    categoryLimits: Record<string, number> = {}
  ) {
    const summary = this.calculateMonthlySummary(
      activeMonth, 
      transactions, 
      accounts, 
      cards, 
      installments, 
      subscriptions, 
      goals, 
      categoryLimits
    );
    const balance = this.calculateCurrentBalance(accounts);
    const totalInv = this.calculateTotalInvestments(investments);
    const cardDebt = this.calculateTotalCardDebt(cards, transactions, installments);
    const netWorth = this.calculateNetWorth(accounts, investments, cards, transactions, installments);
    const bills = this.calculateUpcomingBills('2026-08-02', transactions, subscriptions, installments);

    return {
      userName,
      activeMonth,
      currentBalance: balance,
      totalInvested: totalInv,
      totalCardDebt: cardDebt,
      netWorth,
      monthlyIncome: summary.monthlyIncome,
      monthlyExpense: summary.monthlyExpense,
      monthlyInvested: summary.monthlyInvested,
      savingsRate: summary.savingsRate,
      topCategories: summary.categoryStats.slice(0, 3),
      contasVencidasCount: bills.contasVencidasCount,
      contasVencidasAmount: bills.contasVencidasAmount,
      activeSubscriptionsCount: subscriptions.filter(s => s.active).length,
      activeInstallmentsCount: installments.length
    };
  }
}
