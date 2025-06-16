import { useEffect, useState } from 'react';

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
};

export type FamilyTask = {
  id: string;
  title: string;
  description?: string;
  assignedTo: string[];
  dueDate?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
};

export const useFamilyTasks = () => {
  // Family members state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('familyMembers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'You', role: 'Parent' },
      { id: '2', name: 'Spouse', role: 'Parent' },
      { id: '3', name: 'Child 1', role: 'School-age child' },
      { id: '4', name: 'Child 2', role: 'School-age child' },
      { id: '5', name: 'Child 3', role: 'Young child' },
    ];
  });

  // Family tasks state
  const [familyTasks, setFamilyTasks] = useState<FamilyTask[]>(() => {
    const saved = localStorage.getItem('familyTasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('familyTasks', JSON.stringify(familyTasks));
  }, [familyTasks]);

  // Family member methods
  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember = {
      ...member,
      id: Date.now().toString(),
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, ...updates } : member))
    );
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
  };

  // Family task methods
  const addFamilyTask = (task: Omit<FamilyTask, 'id' | 'completed'>) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    };
    setFamilyTasks((prev) => [...prev, newTask]);
  };

  const updateFamilyTask = (id: string, updates: Partial<FamilyTask>) => {
    setFamilyTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const toggleTaskCompletion = (id: string) => {
    setFamilyTasks((prev) =>
      prev.map((task) => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteFamilyTask = (id: string) => {
    setFamilyTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Get tasks assigned to a family member
  const getTasksByMember = (memberId: string) => {
    return familyTasks.filter((task) => task.assignedTo.includes(memberId));
  };

  return {
    familyMembers,
    familyTasks,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    addFamilyTask,
    updateFamilyTask,
    toggleTaskCompletion,
    deleteFamilyTask,
    getTasksByMember,
  };
};