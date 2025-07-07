import React, { useState } from 'react';
import { 
  DollarSign, PlusCircle, ArrowDownCircle, ArrowUpCircle, Clock, Trash2, Calculator, Check, Edit3
} from 'lucide-react';
import { useFinanceTracking, Transaction, DebtItem } from '../hooks/useFinanceTracking';
import { getRandomQuotes } from '../lib/quotes';
import FloatingCalculator from '../components/FloatingCalculator';
import toast from 'react-hot-toast';

const Finance: React.FC = () => {
  const {
    transactions,
    debts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addDebt,
    updateDebtAmount,
    deleteDebt,
    getFinancialSummary,
  } = useFinanceTracking();

  // State for adding new transaction
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id'>>({
    amount: 0,
    description: '',
    category: 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedDebtId, setSelectedDebtId] = useState<string>('');

  // State for editing transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditTransaction, setShowEditTransaction] = useState(false);

  // State for adding new debt
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newDebt, setNewDebt] = useState<Omit<DebtItem, 'id'>>({
    name: '',
    totalAmount: 0,
    remainingAmount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
  });

  // State for making a payment to a debt
  const [paymentAmount, setPaymentAmount] = useState<{ [key: string]: number }>({});
  
  // State for calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorTarget, setCalculatorTarget] = useState<'transaction' | 'debt' | 'payment' | null>(null);
  const [calculatorDebtId, setCalculatorDebtId] = useState<string | null>(null);

  // Get financial summary
  const summary = getFinancialSummary();

  // Get random financial tips
  const financialTips = getRandomQuotes('financial', 5);

  // Handle transaction input changes
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    
    // Reset selected debt when category changes
    if (name === 'category') {
      setSelectedDebtId('');
    }
  };

  // Handle edit transaction input changes
  const handleEditTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingTransaction) return;
    
    const { name, value } = e.target;
    setEditingTransaction(prev => ({
      ...prev!,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle debt input changes
  const handleDebtChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({
      ...prev,
      [name]: name === 'totalAmount' || name === 'remainingAmount' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle payment amount changes
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const amount = parseFloat(e.target.value) || 0;
    setPaymentAmount(prev => ({ ...prev, [id]: amount }));
  };

  // Submit new transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación para pagos de deuda
    if (newTransaction.category === 'debt') {
      if (!selectedDebtId) {
        toast.error('Debes seleccionar una deuda para registrar el pago');
        return;
      }
      
      if (newTransaction.amount <= 0) {
        toast.error('El monto del pago debe ser mayor a $0');
        return;
      }
      
      const selectedDebt = debts.find(d => d.id === selectedDebtId);
      if (!selectedDebt) {
        toast.error('La deuda seleccionada no existe');
        return;
      }
      
      if (newTransaction.amount > selectedDebt.remainingAmount) {
        toast.error(`El pago no puede ser mayor al monto restante ($${selectedDebt.remainingAmount.toFixed(2)})`);
        return;
      }
      
      // Actualizar el monto restante de la deuda
      updateDebtAmount(selectedDebtId, newTransaction.amount);
      
      // Crear descripción automática si no se especificó
      const description = newTransaction.description || `Pago para ${selectedDebt.name}`;
      
      addTransaction({
        ...newTransaction,
        description
      });
      
      toast.success(`¡Pago de $${newTransaction.amount.toFixed(2)} aplicado a "${selectedDebt.name}"!`);
    } else {
      addTransaction(newTransaction);
      toast.success('¡Transacción agregada exitosamente!');
    }
    
    // Reset form
    setNewTransaction({
      amount: 0,
      description: '',
      category: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedDebtId('');
    setShowAddTransaction(false);
  };

  // Open edit transaction
  const openEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditTransaction(true);
  };

  // Submit edited transaction
  const handleEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    updateTransaction(editingTransaction.id, editingTransaction);
    toast.success('¡Transacción actualizada exitosamente!');
    setEditingTransaction(null);
    setShowEditTransaction(false);
  };

  // Submit new debt
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    addDebt({
      ...newDebt,
      remainingAmount: newDebt.remainingAmount || newDebt.totalAmount,
    });
    toast.success('¡Deuda agregada exitosamente!');
    setNewDebt({
      name: '',
      totalAmount: 0,
      remainingAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
    });
    setShowAddDebt(false);
  };

  // Submit debt payment
  const handleDebtPayment = (e: React.FormEvent, debtId: string) => {
    e.preventDefault();
    const amount = paymentAmount[debtId] || 0;
    if (amount > 0) {
      updateDebtAmount(debtId, amount);
      
      // Add a transaction for this payment
      addTransaction({
        amount: amount,
        description: `Pago para ${debts.find(d => d.id === debtId)?.name}`,
        category: 'debt',
        date: new Date().toISOString().split('T')[0],
      });
      
      toast.success(`¡Pago de $${amount.toFixed(2)} registrado!`);
      
      // Reset payment amount
      setPaymentAmount(prev => ({ ...prev, [debtId]: 0 }));
    }
  };

  // Get category icon and style
  const getCategoryDisplay = (category: 'income' | 'expense' | 'debt') => {
    switch (category) {
      case 'income':
        return {
          icon: <ArrowDownCircle className="h-5 w-5 text-success-500" />,
          textColor: 'text-success-600 dark:text-success-400',
        };
      case 'expense':
        return {
          icon: <ArrowUpCircle className="h-5 w-5 text-error-500" />,
          textColor: 'text-error-600 dark:text-error-400',
        };
      case 'debt':
        return {
          icon: <Clock className="h-5 w-5 text-warning-500" />,
          textColor: 'text-warning-600 dark:text-warning-400',
        };
      default:
        return {
          icon: <DollarSign className="h-5 w-5 text-gray-500" />,
          textColor: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle calculator
  const openCalculator = (target: 'transaction' | 'debt' | 'payment', debtId?: string) => {
    setCalculatorTarget(target);
    setCalculatorDebtId(debtId || null);
    setShowCalculator(true);
  };

  const handleCalculatorResult = (result: number) => {
    const formattedResult = parseFloat(result.toFixed(2));
    
    if (calculatorTarget === 'transaction') {
      setNewTransaction(prev => ({ ...prev, amount: formattedResult }));
    } else if (calculatorTarget === 'debt') {
      setNewDebt(prev => ({ 
        ...prev, 
        totalAmount: formattedResult,
        remainingAmount: formattedResult 
      }));
    } else if (calculatorTarget === 'payment' && calculatorDebtId) {
      setPaymentAmount(prev => ({ ...prev, [calculatorDebtId]: formattedResult }));
    }
    
    setShowCalculator(false);
    setCalculatorTarget(null);
    setCalculatorDebtId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finanzas</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Rastrea tus finanzas y gestiona tus deudas
          </p>
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="card bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-800">
              <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-primary-700 dark:text-primary-300">Balance</p>
              <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-primary-700 dark:text-primary-300' : 'text-error-600 dark:text-error-400'}`}>
                ${summary.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 dark:bg-success-800">
              <ArrowDownCircle className="h-6 w-6 text-success-600 dark:text-success-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-success-700 dark:text-success-300">Ingresos</p>
              <p className="text-2xl font-semibold text-success-700 dark:text-success-300">
                ${summary.totalIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-error-100 dark:bg-error-800">
              <ArrowUpCircle className="h-6 w-6 text-error-600 dark:text-error-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-error-700 dark:text-error-300">Gastos</p>
              <p className="text-2xl font-semibold text-error-700 dark:text-error-300">
                ${summary.totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-info-50 dark:bg-info-900/20 border border-info-100 dark:border-info-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-info-100 dark:bg-info-800">
              <ArrowUpCircle className="h-6 w-6 text-info-600 dark:text-info-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-info-700 dark:text-info-300">Pagos de Deuda</p>
              <p className="text-2xl font-semibold text-info-700 dark:text-info-300">
                ${summary.totalDebtPayments.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-warning-50 dark:bg-warning-900/20 border border-warning-100 dark:border-warning-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-800">
              <Clock className="h-6 w-6 text-warning-600 dark:text-warning-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-warning-700 dark:text-warning-300">Deuda Total</p>
              <p className="text-2xl font-semibold text-warning-700 dark:text-warning-300">
                ${summary.totalDebt.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
        <button
          onClick={() => setShowAddTransaction(true)}
          className="btn btn-primary flex items-center justify-center"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          Agregar Transacción
        </button>
        
        <button
          onClick={() => setShowAddDebt(true)}
          className="btn btn-secondary flex items-center justify-center"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          Agregar Deuda
        </button>
        
        <button
          onClick={() => openCalculator('transaction')}
          className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
        >
          <Calculator className="h-5 w-5 mr-1" />
          Calculadora
        </button>
      </div>

      {/* Debt Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-warning-500" />
          Gestión de Deudas
        </h2>
        
        {debts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deuda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Restante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Límite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {debts.map((debt) => {
                  // Determine priority style
                  let priorityStyle = '';
                  switch (debt.priority) {
                    case 'high':
                      priorityStyle = 'bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-300';
                      break;
                    case 'medium':
                      priorityStyle = 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
                      break;
                    case 'low':
                      priorityStyle = 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
                      break;
                  }
                  
                  return (
                    <tr key={debt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{debt.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total: ${debt.totalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${debt.remainingAmount.toFixed(2)}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary-500 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max(0, 100 - (debt.remainingAmount / debt.totalAmount * 100))}%` 
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(debt.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityStyle}`}>
                          {debt.priority === 'high' ? 'Alta' : debt.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <form onSubmit={(e) => handleDebtPayment(e, debt.id)} className="flex items-center">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={paymentAmount[debt.id] || ''}
                              onChange={(e) => handlePaymentChange(e, debt.id)}
                              className="input pl-7 py-1 text-sm w-32"
                              placeholder="0.00"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => openCalculator('payment', debt.id)}
                            className="ml-1 p-1 text-gray-400 hover:text-primary-500"
                          >
                            <Calculator className="h-4 w-4" />
                          </button>
                          <button
                            type="submit"
                            className="ml-1 p-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        </form>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => deleteDebt(debt.id)}
                          className="text-error-600 dark:text-error-400 hover:text-error-900 dark:hover:text-error-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Clock className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay deudas agregadas</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Agrega tus deudas para hacer seguimiento de pagos y prioridades.
            </p>
            <button
              onClick={() => setShowAddDebt(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Agregar Deuda
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary-500" />
          Transacciones Recientes
        </h2>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => {
              const categoryDisplay = getCategoryDisplay(transaction.category);
              
              return (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center">
                    {categoryDisplay.icon}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-semibold ${categoryDisplay.textColor}`}>
                      {transaction.category === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => openEditTransaction(transaction)}
                      className="ml-2 text-gray-400 hover:text-blue-500"
                      title="Editar transacción"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        deleteTransaction(transaction.id);
                        toast.success('Transacción eliminada');
                      }}
                      className="ml-2 text-gray-400 hover:text-error-500"
                      title="Eliminar transacción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {transactions.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                  Ver todas las transacciones
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay transacciones</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza a rastrear tus ingresos y gastos.
            </p>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Agregar Transacción
            </button>
          </div>
        )}
      </div>

      {/* Financial Tips */}
      <div className="card bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary-500" />
          Consejos Financieros
        </h2>
        
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          {financialTips.map((tip) => (
            <li key={tip.id} className="flex items-start">
              <Check className="h-5 w-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
              <p>{tip.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Agregar Transacción
              </h3>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="label">Descripción</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={newTransaction.description}
                    onChange={handleTransactionChange}
                    className="input"
                    placeholder="ej. Compras, Salario, etc."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="amount" className="label">Cantidad</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newTransaction.amount || ''}
                      onChange={handleTransactionChange}
                      className="input pl-7 pr-12"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => openCalculator('transaction')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-500"
                    >
                      <Calculator className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="label">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={newTransaction.category}
                    onChange={handleTransactionChange}
                    className="input"
                    required
                  >
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                    <option value="debt">Pago de Deuda</option>
                  </select>
                </div>

                {/* Selector de deuda - solo visible cuando category es 'debt' */}
                {newTransaction.category === 'debt' && (
                  <div>
                    <label htmlFor="debtSelect" className="label">Seleccionar Deuda</label>
                    {debts.length > 0 ? (
                      <select
                        id="debtSelect"
                        value={selectedDebtId}
                        onChange={(e) => {
                          setSelectedDebtId(e.target.value);
                          // Auto-rellenar descripción si no hay una
                          if (!newTransaction.description && e.target.value) {
                            const selectedDebt = debts.find(d => d.id === e.target.value);
                            if (selectedDebt) {
                              setNewTransaction(prev => ({
                                ...prev,
                                description: `Pago para ${selectedDebt.name}`
                              }));
                            }
                          }
                        }}
                        className="input"
                        required
                      >
                        <option value="">Selecciona una deuda...</option>
                        {debts.filter(debt => debt.remainingAmount > 0).map((debt) => (
                          <option key={debt.id} value={debt.id}>
                            {debt.name} - Restante: ${debt.remainingAmount.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          No tienes deudas registradas. Agrega una deuda primero para registrar pagos.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label htmlFor="date" className="label">Fecha</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newTransaction.date}
                    onChange={handleTransactionChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTransaction(false);
                    setSelectedDebtId('');
                    setNewTransaction({
                      amount: 0,
                      description: '',
                      category: 'expense',
                      date: new Date().toISOString().split('T')[0],
                    });
                  }}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Agregar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransaction && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Transacción
              </h3>
            </div>
            
            <form onSubmit={handleEditTransaction} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-description" className="label">Descripción</label>
                  <input
                    type="text"
                    id="edit-description"
                    name="description"
                    value={editingTransaction.description}
                    onChange={handleEditTransactionChange}
                    className="input"
                    placeholder="ej. Compras, Salario, etc."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-amount" className="label">Cantidad</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="edit-amount"
                      name="amount"
                      value={editingTransaction.amount || ''}
                      onChange={handleEditTransactionChange}
                      className="input pl-7"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-category" className="label">Categoría</label>
                  <select
                    id="edit-category"
                    name="category"
                    value={editingTransaction.category}
                    onChange={handleEditTransactionChange}
                    className="input"
                  >
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                    <option value="debt">Pago de Deuda</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-date" className="label">Fecha</label>
                  <input
                    type="date"
                    id="edit-date"
                    name="date"
                    value={editingTransaction.date}
                    onChange={handleEditTransactionChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTransaction(false);
                    setEditingTransaction(null);
                  }}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Agregar Deuda
              </h3>
            </div>
            
            <form onSubmit={handleAddDebt} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Nombre de la Deuda</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newDebt.name}
                    onChange={handleDebtChange}
                    className="input"
                    placeholder="ej. Tarjeta de Crédito, Hipoteca, Préstamo, etc."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="totalAmount" className="label">Cantidad Total</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="totalAmount"
                      name="totalAmount"
                      value={newDebt.totalAmount || ''}
                      onChange={handleDebtChange}
                      className="input pl-7 pr-12"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => openCalculator('debt')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-500"
                    >
                      <Calculator className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="remainingAmount" className="label">Cantidad Restante (si es diferente)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="remainingAmount"
                      name="remainingAmount"
                      value={newDebt.remainingAmount || ''}
                      onChange={handleDebtChange}
                      className="input pl-7"
                      placeholder="Igual al total si se deja vacío"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="label">Fecha Límite</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={newDebt.dueDate}
                    onChange={handleDebtChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className="label">Prioridad</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newDebt.priority}
                    onChange={handleDebtChange}
                    className="input"
                  >
                    <option value="high">Alta - Urgente</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDebt(false)}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Agregar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Calculator */}
      {showCalculator && (
        <FloatingCalculator
          onClose={() => {
            setShowCalculator(false);
            setCalculatorTarget(null);
            setCalculatorDebtId(null);
          }}
          onCalculate={handleCalculatorResult}
        />
      )}
    </div>
  );
};

export default Finance;