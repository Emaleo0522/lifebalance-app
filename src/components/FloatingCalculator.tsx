import React, { useState } from 'react';
import { Calculator, X, Minus, Plus, Equal, Trash2 } from 'lucide-react';

interface FloatingCalculatorProps {
  onClose: () => void;
  onCalculate?: (result: number) => void;
}

const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({ onClose, onCalculate }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNext) {
      setDisplay(num);
      setWaitingForNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForNext) {
      setDisplay('0.');
      setWaitingForNext(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNext(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNext(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNext(true);
      
      // NO llamar onCalculate aquí - solo mostrar el resultado
      // onCalculate se llama únicamente desde el botón "Use"
    }
  };

  const buttons = [
    ['C', '⌫', '/', '*'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', 'Use', '']
  ];

  const handleButtonClick = (value: string) => {
    switch (value) {
      case 'C':
        clear();
        break;
      case '⌫':
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay('0');
        }
        break;
      case '=':
        performEquals();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        performOperation(value);
        break;
      case '.':
        inputDot();
        break;
      case 'Use':
        // Usar el resultado actual
        if (onCalculate) {
          onCalculate(parseFloat(display));
        }
        onClose();
        break;
      default:
        if (!isNaN(Number(value))) {
          inputNumber(value);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-xs overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 text-primary-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calculadora
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {previousValue !== null && operation && (
                  `${previousValue} ${operation}`
                )}
              </div>
              <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white break-all">
                {display}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((button, index) => {
              // Saltar botones vacíos
              if (button === '') {
                return <div key={index} className="h-12"></div>;
              }
              
              if (button === '0') {
                return (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(button)}
                    className="col-span-2 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-md transition-colors"
                  >
                    {button}
                  </button>
                );
              }
              
              const isOperation = ['+', '-', '*', '/', '='].includes(button);
              const isSpecial = ['C', '⌫', 'Use'].includes(button);
              
              return (
                <button
                  key={index}
                  onClick={() => handleButtonClick(button)}
                  className={`h-12 font-semibold rounded-md transition-colors ${
                    isOperation
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : isSpecial
                      ? 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  } ${button === 'Use' ? 'text-xs' : ''}`}
                >
                  {button === '⌫' ? <Trash2 className="h-4 w-4 mx-auto" /> : button}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Presiona "Use" para usar el resultado en el formulario
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingCalculator;