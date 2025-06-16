import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { FamilyGroup, FamilyMember, SharedTask, SharedExpense } from '../types/database';

export const useFamilyGroup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);

  // Cargar grupos del usuario
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadGroups = async () => {
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
        console.error('Error al cargar grupos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [user]);

  // Cargar miembros del grupo actual
  useEffect(() => {
    if (!currentGroup) return;

    const loadMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('family_members')
          .select(`
            *,
            users(email)
          `)
          .eq('group_id', currentGroup.id);

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error al cargar miembros:', error);
      }
    };

    loadMembers();
  }, [currentGroup]);

  // Cargar tareas del grupo actual
  useEffect(() => {
    if (!currentGroup) return;

    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('shared_tasks')
          .select('*')
          .eq('group_id', currentGroup.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Error al cargar tareas:', error);
      }
    };

    loadTasks();
  }, [currentGroup]);

  // Cargar gastos del grupo actual
  useEffect(() => {
    if (!currentGroup) return;

    const loadExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from('shared_expenses')
          .select('*')
          .eq('group_id', currentGroup.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (error) {
        console.error('Error al cargar gastos:', error);
      }
    };

    loadExpenses();
  }, [currentGroup]);

  // Crear nuevo grupo
  const createGroup = async (name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('family_groups')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setGroups([...groups, data]);
      setCurrentGroup(data);
      return data;
    } catch (error) {
      console.error('Error al crear grupo:', error);
      return null;
    }
  };

  // Invitar miembro por email
  const inviteMember = async (email: string, role: string) => {
    if (!currentGroup || !user) return false;

    try {
      // Buscar usuario por email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Usuario no encontrado:', userError);
        return false;
      }

      // Agregar miembro al grupo
      const { error } = await supabase
        .from('family_members')
        .insert([{
          group_id: currentGroup.id,
          user_id: userData.id,
          role
        }]);

      if (error) throw error;
      
      // Recargar miembros
      const { data: newMembers } = await supabase
        .from('family_members')
        .select(`
          *,
          users(email)
        `)
        .eq('group_id', currentGroup.id);
      
      setMembers(newMembers || []);
      return true;
    } catch (error) {
      console.error('Error al invitar miembro:', error);
      return false;
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

      if (error) throw error;
      setTasks([data, ...tasks]);
      return data;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      return null;
    }
  };

  // Actualizar tarea
  const updateTask = async (taskId: string, updates: Partial<SharedTask>) => {
    try {
      const { data, error } = await supabase
        .from('shared_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(tasks.map(task => task.id === taskId ? data : task));
      return data;
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      return null;
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

      if (error) throw error;
      setExpenses([data, ...expenses]);
      return data;
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      return null;
    }
  };

  return {
    loading,
    groups,
    currentGroup,
    setCurrentGroup,
    members,
    tasks,
    expenses,
    createGroup,
    inviteMember,
    createTask,
    updateTask,
    createExpense,
  };
};