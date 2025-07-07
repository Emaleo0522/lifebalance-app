import { useEffect, useState } from 'react';
import { safeStorage } from '../lib/storage';
import { logger } from '../lib/logger';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: 'income' | 'expense' | 'debt';
  date: string;
};

export type DebtItem = {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
};

export const useFinanceTracking = () => {
  // Load transactions from localStorage with error handling
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return safeStorage.getItem<Transaction[]>('transactions', []);
  });

  // Load debts from localStorage with error handling
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    return safeStorage.getItem<DebtItem[]>('debts', []);
  });

  // Save to localStorage when data changes with error handling
  useEffect(() => {
    const success = safeStorage.setItem('transactions', transactions);
    if (!success) {
      logger.error('Failed to save transactions to localStorage');
    }
  }, [transactions]);

  useEffect(() => {
    const success = safeStorage.setItem('debts', debts);
    if (!success) {
      logger.error('Failed to save debts to localStorage');
    }
  }, [debts]);

  // Transaction methods
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Debt methods
  const addDebt = (debt: Omit<DebtItem, 'id'>) => {
    const newDebt = {
      ...debt,
      id: Date.now().toString(),
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const updateDebtAmount = (id: string, amount: number) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === id
          ? {
              ...debt,
              remainingAmount: Math.max(0, debt.remainingAmount - amount),
            }
          : debt
      )
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Financial summary
  const getFinancialSummary = () => {
    const totalIncome = transactions
      .filter((t) => t.category === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.category === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Incluir pagos de deuda como gastos en el balance
    const totalDebtPayments = transactions
      .filter((t) => t.category === 'debt')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);

    return {
      totalIncome,
      totalExpenses,
      totalDebtPayments,
      balance: totalIncome - totalExpenses - totalDebtPayments,
      totalDebt,
    };
  };

  return {
    transactions,
    debts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addDebt,
    updateDebtAmount,
    deleteDebt,
    getFinancialSummary,
  };
};