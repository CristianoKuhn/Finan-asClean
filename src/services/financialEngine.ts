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
  InstallmentParcel 
} from '../types';

export interface CalendarEventItem {
  id: string;
  title: string;
  amount: number;
  type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'INVESTIMENTO';
  status: 'PAGO' | 'PENDENTE' | 'ATRASADA' | 'A_VENCER';
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
  status: 'PREVISTA' | 'A_VENCER' | 'VENCE_HOJE' | 'ATRASADA' | 'PAGA' | 'CANCELADA';
  source: string;
}

export class FinancialEngine {

  /**
   * 1. Calculate Current Liquid Balance across all Bank Accounts
   */
  static calculateCurrentBalance(accounts: BankAccount[]): number {
    if (!accounts || accounts.length === 0) return 0;
    return accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  }

  /**
   * 2. Calculate Total Investments Current Value
   */
  static calculateTotalInvestments(investments: Investment[]): number {
    if (!investments || investments.length === 0) return 0;
    return investments.reduce((acc, i) => acc + (i.currentAmount || i.investedAmount || 0), 0);
  }

  /**
   * 3. Calculate Total Credit Card & Installment Debt
   */
  static calculateTotalCardDebt(
    cards: CreditCard[], 
    transactions: Transaction[], 
    installments: InstallmentContract[]
  ): number {
    let total = 0;

    // Card pending transactions
    if (transactions) {
      transactions.forEach(t => {
        if (t.cardId && t.type === 'DESPESA' && t.status !== 'PAGO') {
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
   * 4. Calculate Net Worth (Patrimônio Líquido)
   * Net Worth = Accounts Balance + Investments - Card Debt
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
   * 5. Expand Installment Contracts into explicit Monthly Parcels
   */
  static expandInstallments(installments: InstallmentContract[]): InstallmentParcel[] {
    const result: InstallmentParcel[] = [];
    if (!installments || installments.length === 0) return result;

    const baseYear = 2026;
    const baseMonth = 8; // August 2026

    installments.forEach(inst => {
      for (let p = 1; p <= inst.totalParcels; p++) {
        // Calculate due date per parcel
        const offsetMonths = p - 1;
        const totalMonths = (baseMonth - 1) + offsetMonths;
        const targetYear = baseYear + Math.floor(totalMonths / 12);
        const targetMonth = (totalMonths % 12) + 1;
        const monthStr = targetMonth < 10 ? `0${targetMonth}` : `${targetMonth}`;
        const dueDate = `${targetYear}-${monthStr}-10`;

        const isPaid = p <= inst.currentParcel;

        result.push({
          id: `${inst.id}_p${p}`,
          contractId: inst.id,
          item: inst.item,
          parcelNumber: p,
          totalParcels: inst.totalParcels,
          parcelValue: inst.parcelValue,
          dueDate,
          status: isPaid ? 'PAGO' : 'PENDENTE',
          cardName: inst.cardName || 'Cartão de Crédito'
        });
      }
    });

    return result;
  }

  /**
   * 6. Calculate Monthly Summary (KPIs, Expenses by Category, Budget Limits)
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

    // 1. Direct transactions in activeMonth
    const monthTxns = (transactions || []).filter(t => t.date && t.date.startsWith(activeMonth));
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
    expandedParcels.filter(p => p.dueDate.startsWith(activeMonth)).forEach(p => {
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
   * 7. Calculate Upcoming Bills & Due Dates with strict statuses
   */
  static calculateUpcomingBills(
    todayDateStr: string = '2026-08-02',
    transactions: Transaction[] = [],
    subscriptions: Subscription[] = [],
    installments: InstallmentContract[] = []
  ) {
    const list: UpcomingBillItem[] = [];

    // 1. Pending Transactions
    (transactions || []).filter(t => t.status === 'PENDENTE').forEach(t => {
      let status: UpcomingBillItem['status'] = 'A_VENCER';
      if (t.date < todayDateStr) status = 'ATRASADA';
      else if (t.date === todayDateStr) status = 'VENCE_HOJE';

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
      let status: UpcomingBillItem['status'] = 'A_VENCER';
      if (dueDate < todayDateStr) status = 'ATRASADA';
      else if (dueDate === todayDateStr) status = 'VENCE_HOJE';

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

    // 3. Installments parcels pending
    const parcels = this.expandInstallments(installments);
    parcels.filter(p => p.status === 'PENDENTE').forEach(p => {
      let status: UpcomingBillItem['status'] = 'A_VENCER';
      if (p.dueDate < todayDateStr) status = 'ATRASADA';
      else if (p.dueDate === todayDateStr) status = 'VENCE_HOJE';

      list.push({
        id: p.id,
        description: `${p.item} (${p.parcelNumber}/${p.totalParcels}x)`,
        amount: p.parcelValue,
        date: p.dueDate,
        type: 'DESPESA',
        category: 'Parcelamento',
        status,
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
   * 8. Credit Card Invoices Engine
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
      const cardTxns = (transactions || []).filter(t => t.cardId === card.id || t.description.toLowerCase().includes(card.name.toLowerCase()));
      const cardParcels = expandedParcels.filter(p => p.cardName && p.cardName.toLowerCase().includes(card.name.toLowerCase()));

      let openInvoiceAmount = 0;
      let closedInvoiceAmount = 0;
      const items: CardInvoiceDetail['items'] = [];

      // Transactions
      cardTxns.forEach(t => {
        if (t.type === 'DESPESA') {
          if (t.date.startsWith(activeMonth)) {
            openInvoiceAmount += t.amount;
          } else if (t.date < activeMonth && t.status !== 'PAGO') {
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
        if (p.dueDate.startsWith(activeMonth)) {
          openInvoiceAmount += p.parcelValue;
          items.push({
            description: `${p.item} (${p.parcelNumber}/${p.totalParcels}x)`,
            amount: p.parcelValue,
            date: p.dueDate,
            category: 'Parcelamento'
          });
        } else if (p.dueDate < activeMonth && p.status !== 'PAGO') {
          closedInvoiceAmount += p.parcelValue;
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
   * 9. Calendar Events Engine (Filtered strictly by activeMonth)
   * NO MOCK DATA. Returns real database items mapped to days 1..31 of month.
   */
  static getCalendarEvents(
    activeMonth: string = '2026-08',
    transactions: Transaction[] = [],
    installments: InstallmentContract[] = [],
    subscriptions: Subscription[] = []
  ) {
    const year = parseInt(activeMonth.substring(0, 4));
    const month = parseInt(activeMonth.substring(5, 7));

    // Calculate empty start spaces for month grid
    const firstDay = new Date(year, month - 1, 1);
    const emptySpaces = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month, 0).getDate();

    const eventsByDay: Record<number, CalendarEventItem[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      eventsByDay[d] = [];
    }

    // 1. Transactions
    (transactions || []).forEach(t => {
      if (t.date && t.date.startsWith(activeMonth)) {
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

    // 2. Subscriptions
    (subscriptions || []).filter(s => s.active).forEach(s => {
      const dayNum = Math.min(s.dueDate, daysInMonth);
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      eventsByDay[dayNum].push({
        id: `sub_cal_${s.id}`,
        title: s.name,
        amount: s.amount,
        type: 'DESPESA',
        status: 'PENDENTE',
        category: s.category || 'Assinatura',
        sourceEntity: 'SUBSCRIPTION',
        date: `${activeMonth}-${dayStr}`
      });
    });

    // 3. Installments
    const parcels = this.expandInstallments(installments);
    parcels.filter(p => p.dueDate.startsWith(activeMonth)).forEach(p => {
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
   * 10. Future Cash Flow Timeline Engine
   * Dynamically constructs timeline nodes from database entities
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

    // 1. Pending Future Transactions
    (transactions || []).filter(t => t.status === 'PENDENTE').forEach(t => {
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

    // 3. Installments Parcels
    const parcels = this.expandInstallments(installments);
    parcels.filter(p => p.status === 'PENDENTE').forEach(p => {
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

    // Calculate running balance mathematically
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
   * 11. Historical Cash Flow Data for Reports (Last 6 Months)
   */
  static getHistoricalCashFlow(transactions: Transaction[] = []) {
    const months = ['03', '04', '05', '06', '07', '08'];
    const monthNames = ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];

    return months.map((m, idx) => {
      const prefix = `2026-${m}`;
      let inVal = 0;
      let outVal = 0;

      (transactions || []).filter(t => t.date && t.date.startsWith(prefix)).forEach(t => {
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
   * 12. Consolidates AI Coach Summary object
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
