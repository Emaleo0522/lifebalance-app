import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const RealtimeStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Monitorear el estado de la conexión
    const channel = supabase.channel('connection_status');
    
    channel.subscribe((status) => {
      const connected = status === 'SUBSCRIBED';
      setIsConnected(connected);
      
      // Mostrar el estado por unos segundos cuando cambie
      if (connected) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      } else {
        setShowStatus(true);
      }
    });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
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