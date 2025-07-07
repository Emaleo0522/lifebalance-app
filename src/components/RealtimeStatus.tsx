import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const RealtimeStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Monitorear el estado de la conexión
      const channel = supabase.channel('connection_status');
      
      channel.subscribe((status) => {
        const connected = status === 'SUBSCRIBED';
        setIsConnected(connected);
        
        // Mostrar el estado por unos segundos cuando cambie
        if (connected) {
          setShowStatus(true);
          timeoutId = setTimeout(() => setShowStatus(false), 3000);
        } else {
          setShowStatus(true);
          // Ocultar después de 10 segundos si no hay conexión
          timeoutId = setTimeout(() => setShowStatus(false), 10000);
        }
      });

      // Cleanup
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Error removing realtime channel:', error);
        }
      };
    } catch (error) {
      console.warn('Error setting up realtime connection:', error);
      setIsConnected(false);
      setShowStatus(true);
      timeoutId = setTimeout(() => setShowStatus(false), 5000);
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, []);

  if (!showStatus) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isConnected 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
      }`}
    >
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <Wifi size={16} />
        ) : (
          <WifiOff size={16} />
        )}
        <span className="text-sm font-medium">
          {isConnected ? 'Sincronización activada' : 'Sin conexión en tiempo real'}
        </span>
      </div>
    </div>
  );
};

export default RealtimeStatus;