import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Texto de carga */}
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Cargando LifeBalance...
        </p>
        
        {/* Indicador de progreso opcional */}
        <div className="mt-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
          <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;