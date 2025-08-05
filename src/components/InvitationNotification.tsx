import React, { useState, useEffect } from 'react';
import { X, Check, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContextClerk';
import { INVITATION_ROLE_LABELS, InvitationRole } from '../types/database';
import toast from 'react-hot-toast';

interface InvitationNotificationData {
  id: string;
  invitation_id: string;
  group_id: string;
  inviter_name: string;
  group_name: string;
  role: InvitationRole;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

const InvitationNotification: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InvitationNotificationData[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  // Cargar notificaciones pendientes
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('invitation_notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading notifications:', error);
          return;
        }

        setNotifications(data || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel('invitation_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'invitation_notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as InvitationNotificationData;
        if (newNotification.status === 'pending') {
          setNotifications(prev => [newNotification, ...prev]);
          
          // Mostrar toast de nueva invitación
          toast.success(
            `Nueva invitación al grupo "${newNotification.group_name}" de ${newNotification.inviter_name}`,
            { duration: 5000 }
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleAcceptInvitation = async (notificationId: string) => {
    try {
      setProcessing(notificationId);
      
      const { data, error } = await supabase.rpc('accept_invitation_notification', {
        notification_id: notificationId
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Error al aceptar invitación');
      }

      // Remover notificación de la lista
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast.success('¡Te has unido al grupo familiar exitosamente!');
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectInvitation = async (notificationId: string) => {
    try {
      setProcessing(notificationId);
      
      const { data, error } = await supabase.rpc('reject_invitation_notification', {
        notification_id: notificationId
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Error al rechazar invitación');
      }

      // Remover notificación de la lista
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast.success('Invitación rechazada');
      
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setProcessing(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  };

  // No mostrar si no hay notificaciones
  if (!user || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-up"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Invitación al grupo
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-medium">{notification.inviter_name}</span> te ha invitado a 
                unirte al grupo <span className="font-medium">"{notification.group_name}"</span> como{' '}
                <span className="font-medium">{INVITATION_ROLE_LABELS[notification.role]}</span>
              </p>
              
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={() => handleAcceptInvitation(notification.id)}
                  disabled={processing === notification.id}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {processing === notification.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  Aceptar
                </button>
                
                <button
                  onClick={() => handleRejectInvitation(notification.id)}
                  disabled={processing === notification.id}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {processing === notification.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                  ) : (
                    <X className="w-3 h-3 mr-1" />
                  )}
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitationNotification;