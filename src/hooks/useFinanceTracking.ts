import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from "../context/AuthContextClerk";
import { logger } from '../lib/logger';
// import { withErrorHandling, handleError, success } from '../lib/error-handler';
import { safeStorage } from '../lib/storage';
import toast from 'react-hot-toast';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: 'income' | 'expense' | 'debt';
  subcategory?: 'fixed' | 'variable';
  date: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DebtItem = {
  id: string;
  name: string;
  totalAmount: number;         // UI uses camelCase
  remainingAmount: number;     // UI uses camelCase
  dueDate: string;            // UI uses camelCase
  priority: 'high' | 'medium' | 'low';
  subcategory?: 'fixed' | 'variable';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export const useFinanceTracking = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Función para migrar datos de localStorage a Supabase
  const migrateLocalStorageData = useCallback(async () => {
    if (!user) return;
    
    try {
      setSyncing(true);
      
      // Obtener datos de localStorage
      const localTransactions = safeStorage.getItem<Transaction[]>('transactions', []);
      const localDebts = safeStorage.getItem<DebtItem[]>('debts', []);
      
      // Verificar si ya existen datos en Supabase
      const { data: existingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);
      
      const { data: existingDebts } = await supabase
        .from('debts')
        .select('id')
        .limit(1);
      
      // Solo migrar si no hay datos en Supabase y hay datos locales
      if (localTransactions.length > 0 && (!existingTransactions || existingTransactions.length === 0)) {
        const transactionsToInsert = localTransactions.map(t => ({
          user_id: user.id,
          amount: t.amount,
          description: t.description,
          category: t.category,
          date: new Date(t.date).toISOString()
        }));
        
        const { error } = await supabase
          .from('transactions')
          .insert(transactionsToInsert);
          
        if (error) throw error;
        
        logger.info(`Migrated ${localTransactions.length} transactions to Supabase`);
        toast.success(`Migrado ${localTransactions.length} transacciones a la nube`);
      }
      
      if (localDebts.length > 0 && (!existingDebts || existingDebts.length === 0)) {
        const debtsToInsert = localDebts.map(d => ({
          user_id: user.id,
          name: d.name,
          total_amount: d.totalAmount,
          remaining_amount: d.remainingAmount,
          due_date: d.dueDate,
          priority: d.priority
        }));
        
        const { error } = await supabase
          .from('debts')
          .insert(debtsToInsert);
          
        if (error) throw error;
        
        logger.info(`Migrated ${localDebts.length} debts to Supabase`);
        toast.success(`Migrado ${localDebts.length} deudas a la nube`);
      }
      
    } catch (error) {
      logger.error('Error migrating data:', error);
      toast.error('Error al migrar datos locales');
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Cargar datos desde Supabase
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Cargar transacciones
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Cargar deudas
      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (debtsError) throw debtsError;
      
      // Mapear datos de Supabase al formato del hook
      const mappedTransactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        amount: parseFloat(t.amount),
        description: t.description,
        category: t.category,
        subcategory: t.subcategory || undefined,
        date: t.date,
        user_id: t.user_id,
        created_at: t.created_at,
        updated_at: t.updated_at
      }));
      
      const mappedDebts: DebtItem[] = (debtsData || []).map(d => ({
        id: d.id,
        name: d.name,
        totalAmount: parseFloat(d.total_amount),
        remainingAmount: parseFloat(d.remaining_amount),
        dueDate: d.due_date,
        priority: d.priority,
        subcategory: d.subcategory || undefined,
        user_id: d.user_id,
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
      
      setTransactions(mappedTransactions);
      setDebts(mappedDebts);
      
    } catch (error) {
      logger.error('Error loading data:', error);
      toast.error('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    if (user) {
      migrateLocalStorageData().then(() => {
        loadData();
      });
    } else {
      setTransactions([]);
      setDebts([]);
      setLoading(false);
    }
  }, [user, migrateLocalStorageData, loadData]);

  // Transaction methods
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar transacciones');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          subcategory: transaction.subcategory || null,
          date: new Date(transaction.date).toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newTransaction: Transaction = {
        id: data.id,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        subcategory: data.subcategory || undefined,
        date: data.date,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transacción agregada');
      
    } catch (error) {
      logger.error('Error adding transaction:', error);
      toast.error('Error al agregar transacción');
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    
    try {
      const updateData: Partial<Pick<Transaction, 'amount' | 'description' | 'category' | 'subcategory' | 'date'>> = {};
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory || null;
      if (updates.date !== undefined) updateData.date = new Date(updates.date).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedTransaction: Transaction = {
        id: data.id,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        subcategory: data.subcategory || undefined,
        date: data.date,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? updatedTransaction : transaction
        )
      );
      
      toast.success('Transacción actualizada');
      
    } catch (error) {
      logger.error('Error updating transaction:', error);
      toast.error('Error al actualizar transacción');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transacción eliminada');
      
    } catch (error) {
      logger.error('Error deleting transaction:', error);
      toast.error('Error al eliminar transacción');
    }
  };

  // Debt methods
  const addDebt = async (debt: Omit<DebtItem, 'id'>) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar deudas');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          user_id: user.id,
          name: debt.name,
          total_amount: debt.totalAmount,
          remaining_amount: debt.remainingAmount,
          due_date: debt.dueDate,
          priority: debt.priority,
          subcategory: debt.subcategory || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newDebt: DebtItem = {
        id: data.id,
        name: data.name,
        totalAmount: parseFloat(data.total_amount),
        remainingAmount: parseFloat(data.remaining_amount),
        dueDate: data.due_date,
        priority: data.priority,
        subcategory: data.subcategory || undefined,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setDebts(prev => [...prev, newDebt]);
      toast.success('Deuda agregada');
      
    } catch (error) {
      logger.error('Error adding debt:', error);
      toast.error('Error al agregar deuda');
    }
  };

  const updateDebtAmount = async (id: string, amount: number) => {
    if (!user) return;
    
    try {
      // Encontrar la deuda actual para calcular el nuevo remaining_amount
      const currentDebt = debts.find(d => d.id === id);
      if (!currentDebt) return;
      
      const newRemainingAmount = Math.max(0, currentDebt.remainingAmount - amount);
      
      const { data, error } = await supabase
        .from('debts')
        .update({ remaining_amount: newRemainingAmount })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedDebt: DebtItem = {
        id: data.id,
        name: data.name,
        totalAmount: parseFloat(data.total_amount),
        remainingAmount: parseFloat(data.remaining_amount),
        dueDate: data.due_date,
        priority: data.priority,
        subcategory: data.subcategory || undefined,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setDebts(prev =>
        prev.map(debt => debt.id === id ? updatedDebt : debt)
      );
      
      toast.success('Pago de deuda registrado');
      
    } catch (error) {
      logger.error('Error updating debt amount:', error);
      toast.error('Error al actualizar deuda');
    }
  };

  const deleteDebt = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setDebts(prev => prev.filter(d => d.id !== id));
      toast.success('Deuda eliminada');
      
    } catch (error) {
      logger.error('Error deleting debt:', error);
      toast.error('Error al eliminar deuda');
    }
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
    loading,
    syncing,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addDebt,
    updateDebtAmount,
    deleteDebt,
    getFinancialSummary,
    refreshData: loadData,
  };
};