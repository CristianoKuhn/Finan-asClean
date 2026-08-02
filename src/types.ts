/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColumnSchema {
  name: string;
  type: string;
  keyType?: 'PK' | 'FK' | 'NONE'; // PK: Primary Key, FK: Foreign Key
  refTable?: string;
  description: string;
  sampleValue: string;
}

export interface SheetTable {
  id: string;
  name: string;
  description: string;
  formulaNote?: string;
  columns: ColumnSchema[];
  sampleRows: Record<string, any>[];
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: string;
  responseBody: string;
  codeSnippet: string;
}

export type FinancialStatus = 
  | 'PREVISTA' 
  | 'A_VENCER' 
  | 'VENCE_HOJE' 
  | 'PAGA' 
  | 'ATRASADA' 
  | 'CANCELADA' 
  | 'PAGO' 
  | 'PENDENTE';

export interface FinancialPayment {
  id: string;
  transactionId: string;
  amountPaid: number;
  paymentDate: string;
  accountId?: string;
  cardId?: string;
  notes?: string;
}

export interface FinancialObligation {
  id: string;
  description: string;
  amount: number;
  type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'INVESTIMENTO';
  category: string;
  subcategory?: string;
  recurrenceType?: 'MENSAL' | 'ANUAL' | 'UNICA' | 'PARCELADA';
  dueDay?: number;
  totalParcels?: number;
  startDate: string;
  accountId?: string;
  cardId?: string;
  paymentMethod: 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TED';
  notes?: string;
  active: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'INVESTIMENTO';
  category: string;
  subcategory: string;
  accountId: string;
  cardId?: string;
  paymentMethod: 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TED';
  date: string;
  time: string;
  notes?: string;
  attachmentName?: string;
  status: FinancialStatus;
  paidAt?: string;
  paidAmount?: number;
  obligationId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  tags?: string[];
  location?: string;
  relatedPerson?: string;
  isFavorite?: boolean;
  recurrent?: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'CORRENTE' | 'POUPANCA' | 'CARTEIRA' | 'CAIXINHA' | 'DIGITAL';
  bankName: string;
  balance: number;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bankName: string;
  limit: number;
  usedLimit: number;
  availableLimit: number;
  invoiceClosingDay: number;
  invoiceDueDay: number;
  bestPurchaseDay: number;
  color: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'TESOURO' | 'CDB' | 'LCI_LCA' | 'ACOES' | 'FIIS' | 'CRIPTO';
  institution: string;
  investedAmount: number;
  currentAmount: number;
  yieldRate: string;
  yieldProfit: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: number; // Day of the month
  paymentMethod: string;
  active: boolean;
  logo: string;
}

export interface InstallmentContract {
  id: string;
  item: string;
  totalAmount: number;
  parcelValue: number;
  currentParcel: number;
  totalParcels: number;
  cardName: string;
  startDate?: string;
  accountId?: string;
  cardId?: string;
  category?: string;
}

export interface InstallmentParcel {
  id: string;
  contractId: string;
  item: string;
  parcelNumber: number;
  totalParcels: number;
  parcelValue: number;
  dueDate: string;
  status: FinancialStatus;
  cardName: string;
}
