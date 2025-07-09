import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from "../context/AuthContextHybrid";
import type { FamilyGroup, FamilyMember, SharedTask, SharedExpense } from '../types/database';
import { logger } from '../lib/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { playTaskSound } from '../lib/audio';

export const useFamilyGroup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Cargar grupos del usuario
  const loadGroups = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Primero obtener grupos donde el usuario es propietario
      const { data: ownedGroups, error: ownedError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Luego obtener grupos donde el usuario es miembro
      const { data: memberGroups, error: memberError } = await supabase
        .from('family_members')
        .select('family_groups(*)')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Combinar ambos resultados
      const allGroups = [
        ...(ownedGroups || []),
        ...(memberGroups?.map(m => m.family_groups).filter(Boolean) || [])
      ];

      // Eliminar duplicados
      const uniqueGroups = allGroups.filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      );

      setGroups(uniqueGroups);
      
      // Si hay grupos, seleccionar el primero por defecto
      if (uniqueGroups.length > 0) {
        setCurrentGroup(uniqueGroups[0]);
      }
    } catch (error) {
      logger.error('Error al cargar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar miembros del grupo actual
  const loadMembers = async (groupId: string) => {
    try {
      // CAMBIO: Hacer consultas separadas en lugar de JOIN
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('*')  // <- SIN el join a users
        .eq('group_id', groupId);

      if (membersError) {
        logger.error('Error al cargar miembros:', membersError);
        setMembers([]);
        return;
      }

      // Si hay miembros, obtener sus emails por separado
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(member => member.user_id);
        
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, name, username, display_name, family_role, avatar_icon')
          .in('id', userIds);

        if (usersError) {
          logger.error('Error al cargar usuarios:', usersError);
          // Aún así mostrar los miembros sin información del usuario
          setMembers(membersData.map(member => ({
            ...member,
            users: { 
              email: 'Email no disponible',
              name: null,
              display_name: null,
              family_role: 'member',
              avatar_icon: 'user'
            }
          })));
          return;
        }

        // Combinar datos manualmente
        const membersWithProfiles = membersData.map(member => {
          const user = usersData?.find(u => u.id === member.user_id);
          return {
            ...member,
            users: { 
              email: user?.email || 'Email no disponible',
              name: user?.name || null,
              display_name: user?.display_name || null,
              family_role: user?.family_role || 'member',
              avatar_icon: user?.avatar_icon || 'user'
            }
          };
        });

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error) {
      logger.error('Error inesperado al cargar miembros:', error);
      setMembers([]);
    }
  };

  // Cargar tareas del grupo actual
  const loadTasks = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('shared_tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error al cargar tareas:', error);
        setTasks([]);
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      logger.error('Error inesperado al cargar tareas:', error);
      setTasks([]);
    }
  };

  // Cargar gastos del grupo actual
  const loadExpenses = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('shared_expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error al cargar gastos:', error);
        setExpenses([]);
      } else {
        setExpenses(data || []);
      }
    } catch (error) {
      logger.error('Error inesperado al cargar gastos:', error);
      setExpenses([]);
    }
  };

  // Crear nuevo grupo
  const createGroup = async (name: string) => {
    if (!user) {
      logger.log('No hay usuario autenticado');
      return null;
    }

    logger.log('Usuario actual:', user.id, user.email);
    logger.log('Creando grupo:', name);

    try {
      const { data, error } = await supabase
        .from('family_groups')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();

      if (error) {
        logger.error('Error específico de Supabase:', error);
        logger.error('Código de error:', error.code);
        logger.error('Mensaje:', error.message);
        throw error;
      }
      
      logger.log('Grupo creado exitosamente:', data);
      setGroups([...groups, data]);
      setCurrentGroup(data);
      return data;
    } catch (error) {
      logger.error('Error general al crear grupo:', error);
      return null;
    }
  };

  // Eliminar grupo familiar
  const deleteGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('family_groups')
        .delete()
        .eq('id', groupId)
        .eq('owner_id', user.id); // Solo el owner puede eliminar

      if (error) {
        logger.error('Error al eliminar grupo:', error);
        return false;
      }

      // Actualizar estado local
      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
      
      // Si eliminamos el grupo actual, seleccionar otro o limpiar
      if (currentGroup?.id === groupId) {
        setCurrentGroup(updatedGroups.length > 0 ? updatedGroups[0] : null);
        setMembers([]);
        setTasks([]);
        setExpenses([]);
      }

      return true;
    } catch (error) {
      logger.error('Error inesperado al eliminar grupo:', error);
      return false;
    }
  };

  // Invitar miembro por email
  const inviteMember = async (email: string, role: string) => {
    if (!currentGroup || !user) return { success: false, type: 'error', message: 'Datos inválidos' };

    try {
      // Primero buscar el usuario por email para obtener su ID
      const { data: userToCheck, error: userCheckError } = await supabase
        .from('users')
        .select('id, name, display_name')
        .eq('email', email)
        .maybeSingle();

      if (userCheckError) {
        logger.error('Error al buscar usuario por email:', userCheckError);
        return { success: false, type: 'error', message: 'Error al verificar usuario' };
      }

      // Si el usuario existe, verificar si ya es miembro del grupo
      if (userToCheck) {
        const { data: existingMember, error: memberError } = await supabase
          .from('family_members')
          .select('id')
          .eq('group_id', currentGroup.id)
          .eq('user_id', userToCheck.id)
          .maybeSingle();

        if (memberError) {
          logger.error('Error al verificar miembro existente:', memberError);
          return { success: false, type: 'error', message: 'Error al verificar membresía existente' };
        }

        if (existingMember) {
          return { success: false, type: 'warning', message: 'Este usuario ya es miembro del grupo' };
        }
      }

      // Crear invitación pendiente con información completa
      const invitationData = {
        email: email,
        group_id: currentGroup.id,
        invited_by: user.id,
        role: role,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        family_group_name: currentGroup.name,
        inviter_name: (user as any).display_name || (user as any).name || 'Usuario'
      };

      const { data: createdInvitation, error: pendingError } = await supabase
        .from('pending_invitations')
        .insert([invitationData])
        .select()
        .single();

      if (pendingError) {
        logger.error('Error al crear invitación:', pendingError);
        return { success: false, type: 'error', message: 'Error al crear invitación' };
      }

      // Enviar email de invitación
      try {
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            invitationId: createdInvitation.id,
            email: email,
            inviterName: (user as any).display_name || (user as any).name || 'Usuario',
            familyGroupName: currentGroup.name,
            role: role,
            invitationToken: createdInvitation.invitation_token
          }
        });

        if (emailError) {
          logger.error('Error al enviar email de invitación:', emailError);
          // No fallar completamente, la invitación se creó correctamente
          console.warn('Email no enviado, pero invitación creada');
        }
      } catch (emailError) {
        logger.error('Error al invocar función de email:', emailError);
        // No fallar completamente, la invitación se creó correctamente
        console.warn('Error al enviar email, pero invitación creada');
      }

      if (userToCheck) {
        // CASO 1: Usuario ya registrado
        logger.log('Usuario registrado encontrado, invitación enviada:', email);

        return { 
          success: true, 
          type: 'invitation_sent', 
          message: `Invitación enviada a ${userToCheck.display_name || userToCheck.name || email}. Recibirá un correo para unirse al grupo.` 
        };

      } else {
        // CASO 2: Usuario no registrado
        logger.log('Usuario no registrado, invitación enviada:', email);

        return { 
          success: true, 
          type: 'invitation_sent', 
          message: `Invitación enviada a ${email}. Podrá registrarse y unirse al grupo usando el enlace del correo.` 
        };
      }

    } catch (error) {
      logger.error('Error inesperado al invitar miembro:', error);
      return { success: false, type: 'error', message: 'Error inesperado al enviar invitación' };
    }
  };

  // Crear tarea compartida
  const createTask = async (task: Omit<SharedTask, 'id' | 'created_at' | 'created_by' | 'group_id'>) => {
    if (!currentGroup || !user) return null;

    try {
      const { data, error } = await supabase
        .from('shared_tasks')
        .insert([{
          ...task,
          group_id: currentGroup.id,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error al crear tarea:', error);
        return null;
      }
      
      // NO actualizar el estado local aquí - dejamos que lo haga el tiempo real
      // setTasks([data, ...tasks]); // ❌ REMOVIDO - evita duplicados
      logger.log('Tarea creada exitosamente, esperando actualización via realtime:', data.id);
      return data;
    } catch (error) {
      logger.error('Error inesperado al crear tarea:', error);
      return null;
    }
  };

  // Actualizar tarea (CORREGIDO para toggle)
  const updateTask = async (taskId: string, updates: Partial<SharedTask>) => {
    try {
      const { data, error } = await supabase
        .from('shared_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        logger.error('Error al actualizar tarea:', error);
        return null;
      }
      
      // NO actualizar el estado local aquí - dejamos que lo haga el tiempo real
      // setTasks(tasks.map(task => task.id === taskId ? data : task)); // ❌ REMOVIDO
      logger.log('Tarea actualizada exitosamente, esperando actualización via realtime:', taskId);
      return data;
    } catch (error) {
      logger.error('Error inesperado al actualizar tarea:', error);
      return null;
    }
  };

  // Eliminar tarea
  const deleteTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shared_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        logger.error('Error al eliminar tarea:', error);
        return false;
      }

      logger.log('Tarea eliminada exitosamente en BD, esperando actualización via realtime:', taskId);
      
      // Respaldo: Si después de 2 segundos no se actualizó via realtime, forzar actualización
      setTimeout(() => {
        setTasks(prev => {
          const stillExists = prev.some(task => task.id === taskId);
          if (stillExists) {
            logger.warn('Realtime no actualizó, forzando eliminación local:', taskId);
            return prev.filter(task => task.id !== taskId);
          }
          return prev;
        });
      }, 2000);
      
      return true;
    } catch (error) {
      logger.error('Error inesperado al eliminar tarea:', error);
      return false;
    }
  };

  // Registrar gasto compartido
  const createExpense = async (expense: Omit<SharedExpense, 'id' | 'created_at' | 'group_id'>) => {
    if (!currentGroup || !user) return null;

    try {
      const { data, error } = await supabase
        .from('shared_expenses')
        .insert([{
          ...expense,
          group_id: currentGroup.id
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error al registrar gasto:', error);
        return null;
      }
      
      setExpenses([data, ...expenses]);
      return data;
    } catch (error) {
      logger.error('Error inesperado al registrar gasto:', error);
      return null;
    }
  };

  // Configurar suscripciones en tiempo real
  const setupRealtimeSubscriptions = (groupId: string) => {
    // Limpiar suscripción anterior si existe
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel);
      } catch (error) {
        logger.warn('Error removing previous channel:', error);
      }
    }

    const channel = supabase
      .channel(`family_group_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_tasks',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          logger.log('Cambio en tiempo real - Tareas:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as SharedTask;
            // Evitar duplicados - solo agregar si no existe ya
            setTasks(prev => {
              const exists = prev.some(task => task.id === newTask.id);
              if (exists) {
                logger.log('Tarea ya existe, evitando duplicado:', newTask.id);
                return prev;
              }
              return [newTask, ...prev];
            });
            // Solo mostrar notificación si no es del usuario actual
            if (newTask.created_by !== user?.id) {
              playTaskSound();
              toast.success('Nueva tarea familiar agregada', { 
                icon: '✨',
                duration: 3000
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as SharedTask;
            setTasks(prev => prev.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            ));
            // Notificar cambios importantes
            if (payload.old.completed !== updatedTask.completed && updatedTask.created_by !== user?.id) {
              playTaskSound();
              toast.success(
                updatedTask.completed ? 'Tarea completada por otro miembro' : 'Tarea marcada como pendiente',
                { icon: updatedTask.completed ? '✅' : '📋' }
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedTaskId = payload.old.id;
            logger.log('Evento DELETE recibido para tarea:', deletedTaskId);
            
            setTasks(prev => {
              const initialCount = prev.length;
              const filtered = prev.filter(task => task.id !== deletedTaskId);
              const finalCount = filtered.length;
              
              logger.log(`Eliminación procesada: ${initialCount} -> ${finalCount} tareas`);
              
              // Verificar que realmente se eliminó
              if (initialCount === finalCount) {
                logger.warn('La tarea no se encontró en el estado local:', deletedTaskId);
              }
              
              return filtered;
            });
            
            // Solo mostrar notificación si otro usuario eliminó la tarea
            if (payload.old.created_by !== user?.id) {
              toast('Tarea eliminada por otro miembro', { icon: '🗑️' });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          logger.log('Cambio en tiempo real - Miembros:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Recargar miembros para obtener información completa del usuario
            loadMembers(groupId);
            if (payload.new.user_id !== user?.id) {
              playTaskSound();
              toast.success('Nuevo miembro se unió al grupo', { 
                icon: '👥',
                duration: 3000
              });
            }
          } else if (payload.eventType === 'DELETE') {
            // Recargar miembros
            loadMembers(groupId);
            toast('Un miembro dejó el grupo', { icon: '👋' });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_expenses',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          logger.log('Cambio en tiempo real - Gastos:', payload);
          
          if (payload.eventType === 'INSERT') {
            setExpenses(prev => [payload.new as SharedExpense, ...prev]);
            if (payload.new.created_by !== user?.id) {
              playTaskSound();
              toast.success('Nuevo gasto compartido agregado', { 
                icon: '💰',
                duration: 3000
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setExpenses(prev => prev.filter(expense => expense.id !== payload.old.id));
            toast('Gasto eliminado', { icon: '🗑️' });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.log('Suscripción en tiempo real establecida para grupo:', groupId);
          // ❌ REMOVIDO - No mostrar toast de conexión
          // Solo loggear para debug
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('Error en canal de tiempo real:', status);
          // ❌ TEMPORALMENTE DESHABILITADO - Evitar spam de toasts
          // toast.error('Error en sincronización en tiempo real', { 
          //   icon: '⚠️',
          //   duration: 3000
          // });
        } else if (status === 'CLOSED') {
          logger.log('Canal de tiempo real cerrado');
        }
      });

    setRealtimeChannel(channel);
  };

  // Limpiar suscripciones al desmontar
  const cleanupRealtimeSubscriptions = () => {
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel);
      } catch (error) {
        logger.warn('Error cleaning up realtime subscriptions:', error);
      }
      setRealtimeChannel(null);
    }
  };

  // Effect para cargar grupos cuando cambia el usuario
  useEffect(() => {
    loadGroups();
  }, [user]);

  // Effect para cargar datos cuando cambia el grupo actual
  useEffect(() => {
    if (currentGroup) {
      // Cargar datos de manera asíncrona sin bloquear
      Promise.all([
        loadMembers(currentGroup.id),
        loadTasks(currentGroup.id),
        loadExpenses(currentGroup.id)
      ]).catch(error => {
        logger.error('Error loading group data:', error);
      });
      
      // Configurar suscripciones en tiempo real después de un pequeño delay
      const timeoutId = setTimeout(() => {
        try {
          setupRealtimeSubscriptions(currentGroup.id);
        } catch (error) {
          logger.error('Error setting up realtime subscriptions:', error);
        }
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        cleanupRealtimeSubscriptions();
      };
    } else {
      // Limpiar suscripciones si no hay grupo
      cleanupRealtimeSubscriptions();
    }
  }, [currentGroup]);

  // Effect para limpiar suscripciones al desmontar el componente
  useEffect(() => {
    return () => {
      cleanupRealtimeSubscriptions();
    };
  }, []);

  return {
    loading,
    groups,
    currentGroup,
    setCurrentGroup,
    members,
    tasks,
    expenses,
    createGroup,
    deleteGroup,     // <- NUEVO
    inviteMember,
    createTask,
    updateTask,
    deleteTask,      // <- NUEVO
    createExpense,
  };
};