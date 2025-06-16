import { useEffect, useState } from 'react';

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
  // Load transactions from localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Load debts from localStorage
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem('debts');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);

  // Transaction methods
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
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

    const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalDebt,
    };
  };

  return {
    transactions,
    debts,
    addTransaction,
    deleteTransaction,
    addDebt,
    updateDebtAmount,
    deleteDebt,
    getFinancialSummary,
  };
};