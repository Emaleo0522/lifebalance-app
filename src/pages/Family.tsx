import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, Trash2, Check, UserPlus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useFamilyGroup } from '../hooks/useFamilyGroup';
import { useAuth } from "../context/AuthContextClerk";
import { FAMILY_ROLE_LABELS, AVATAR_ICON_SYMBOLS, InvitationRole, INVITATION_ROLE_LABELS, FamilyMember, SharedTask } from '../types/database';
import { logger } from '../lib/logger';
import toast from 'react-hot-toast';

const Family: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Helper function to get display name
  const getMemberDisplayName = (member: FamilyMember) => {
    const userData = member.users;
    if (!userData) return 'Usuario';
    
    return userData.display_name || 
           userData.name || 
           userData.email?.split('@')[0] || 
           'Usuario';
  };

  // Helper function to get avatar icon
  const getMemberAvatarIcon = (member: FamilyMember) => {
    const userData = member.users;
    const iconKey = userData?.avatar_icon || 'user';
    return AVATAR_ICON_SYMBOLS[iconKey as keyof typeof AVATAR_ICON_SYMBOLS] || AVATAR_ICON_SYMBOLS.user;
  };

  // Helper function to get role label
  const getMemberRoleLabel = (member: FamilyMember) => {
    const userData = member.users;
    const familyRole = userData?.family_role || 'member';
    return FAMILY_ROLE_LABELS[familyRole as keyof typeof FAMILY_ROLE_LABELS] || member.role || 'Miembro';
  };

  const { user } = useAuth();
  const {
    loading,
    groups,
    currentGroup,
    setCurrentGroup,
    members,
    tasks,
    createGroup,
    deleteGroup,
    inviteMember,
    createTask,
    updateTask,
    deleteTask,
  } = useFamilyGroup();

  // State for forms
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InvitationRole>('member');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: [] as string[],
    due_date: '',
    due_time: '',
  });

  // Handle query parameters for group join feedback
  useEffect(() => {
    const joined = searchParams.get('joined');
    const error = searchParams.get('error');
    
    if (joined === 'true') {
      toast.success('¡Te has unido exitosamente al grupo familiar!', {
        duration: 5000,
        icon: '🎉'
      });
    } else if (error === 'group_join_error') {
      toast.error('Error al unirse al grupo familiar. Intenta nuevamente.', {
        duration: 5000,
        icon: '⚠️'
      });
    }
  }, [searchParams]);

  // Handle create group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      const loadingToast = toast.loading('Creando grupo familiar...');
      const group = await createGroup(newGroupName.trim());
      if (group) {
        toast.success('¡Grupo familiar creado exitosamente!', { id: loadingToast });
        setNewGroupName('');
        setShowGroupForm(false);
      } else {
        toast.error('Error al crear el grupo familiar', { id: loadingToast });
      }
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!currentGroup) return;
    
    // Usar toast personalizado para confirmación
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              LifeBalance
            </h3>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          ¿Estás seguro de que quieres eliminar el grupo "{currentGroup.name}"? Esta acción no se puede deshacer.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading('Eliminando grupo...');
              const success = await deleteGroup(currentGroup.id);
              if (success) {
                toast.success('Grupo eliminado exitosamente', { id: loadingToast });
              } else {
                toast.error('Error al eliminar el grupo', { id: loadingToast });
              }
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  // Handle invite member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      const loadingToast = toast.loading('Procesando invitación...');
      const result = await inviteMember(inviteEmail.trim(), inviteRole);
      
      if (result.success) {
        // Diferentes mensajes según el tipo de resultado
        if (result.type === 'existing_user') {
          toast.success(result.message, { id: loadingToast });
        } else if (result.type === 'invitation_sent') {
          toast.success(result.message, { 
            id: loadingToast,
            duration: 5000,
            icon: '📧'
          });
        }
      } else {
        // Diferentes tipos de error
        if (result.type === 'warning') {
          toast.error(result.message, { id: loadingToast, icon: '⚠️' });
        } else {
          toast.error(result.message, { id: loadingToast });
        }
      }
      
      // Siempre limpiar formulario y cerrar modal, sin importar el resultado
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
    }
  };

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      const loadingToast = toast.loading('Creando tarea...');
      const task = await createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        assigned_to: newTask.assigned_to,
        due_date: newTask.due_date || undefined,
        due_time: newTask.due_time || undefined,
        completed: false,
      });
      
      if (task) {
        toast.success('¡Tarea creada exitosamente!', { id: loadingToast });
        setNewTask({
          title: '',
          description: '',
          assigned_to: [],
          due_date: '',
          due_time: '',
        });
        setShowTaskForm(false);
      } else {
        toast.error('Error al crear la tarea', { id: loadingToast });
      }
    }
  };

  // Handle task completion toggle
  const handleToggleTask = async (taskId: string, completed: boolean, task: SharedTask) => {
    // Verificar permisos: solo quien creó la tarea o está asignado puede marcarla
    const canToggle = task.created_by === user?.id || task.assigned_to.includes(user?.id);
    
    if (!canToggle) {
      toast.error('Solo puedes marcar tareas que creaste o que te fueron asignadas');
      return;
    }

    const success = await updateTask(taskId, { completed: !completed });
    if (success) {
      toast.success(completed ? 'Tarea marcada como pendiente' : '¡Tarea completada!');
    } else {
      toast.error('Error al actualizar la tarea');
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string, taskTitle: string, task: SharedTask) => {
    // Verificar permisos: solo quien creó la tarea puede eliminarla
    if (task.created_by !== user?.id) {
      toast.error('Solo puedes eliminar tareas que tú creaste');
      return;
    }

    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?`);
    if (confirmed) {
      logger.debug('Starting task deletion', { taskId, taskTitle, userId: user?.id });
      
      const loadingToast = toast.loading('Eliminando tarea...');
      const success = await deleteTask(taskId);
      
      if (success) {
        logger.info('Task deleted successfully', { taskId });
        toast.success('Tarea eliminada exitosamente', { id: loadingToast });
      } else {
        logger.error('Failed to delete task', undefined, { taskId });
        toast.error('Error al eliminar la tarea', { id: loadingToast });
      }
    }
  };

  // Handle assignment change
  const handleAssignmentChange = (memberId: string, checked: boolean) => {
    if (checked) {
      setNewTask(prev => ({
        ...prev,
        assigned_to: [...prev.assigned_to, memberId]
      }));
    } else {
      setNewTask(prev => ({
        ...prev,
        assigned_to: prev.assigned_to.filter(id => id !== memberId)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión Familiar</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Organiza tareas y responsabilidades familiares
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {!currentGroup && (
            <button
              onClick={() => setShowGroupForm(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              Crear Grupo Familiar
            </button>
          )}
          
          {currentGroup && (
            <>
              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-5 w-5 mr-1" />
                Agregar Tarea
              </button>
              
              <button
                onClick={() => setShowInviteForm(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlus className="h-5 w-5 mr-1" />
                Invitar Miembro
              </button>
            </>
          )}
        </div>
      </div>

      {/* Group Selection */}
      {groups.length > 1 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Seleccionar Grupo Familiar
          </h2>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setCurrentGroup(group)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentGroup?.id === group.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentGroup ? (
        <>
          {/* Current Group Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentGroup.name}
                </h2>
              </div>
              <button
                onClick={handleDeleteGroup}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Eliminar grupo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Members Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Miembros ({members.length})
                </h3>
                {members.length > 0 ? (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-lg">
                              {getMemberAvatarIcon(member)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {getMemberDisplayName(member)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getMemberRoleLabel(member)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No hay miembros en este grupo aún.</p>
                )}
              </div>

              {/* Statistics Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Estadísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tareas Totales</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tareas Completadas</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {tasks.filter(task => task.completed).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tareas Pendientes</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {tasks.filter(task => !task.completed).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-500" />
                Tareas Familiares
              </h3>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-5">
                        {(() => {
                          const canToggle = task.created_by === user?.id || task.assigned_to.includes(user?.id || '');
                          return (
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id, task.completed, task)}
                              disabled={!canToggle}
                              className={`w-4 h-4 rounded focus:ring-2 ${
                                canToggle 
                                  ? 'text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-900 dark:bg-gray-700 dark:border-gray-600 cursor-pointer'
                                  : 'text-gray-400 bg-gray-200 border-gray-300 cursor-not-allowed dark:bg-gray-600 dark:border-gray-500'
                              }`}
                              title={canToggle ? 'Marcar como completada' : 'Solo puedes marcar tareas asignadas a ti o que creaste'}
                            />
                          );
                        })()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${task.completed ? 
                              'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {task.description}
                              </p>
                            )}
                            
                            {(task.due_date || task.due_time) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {task.due_date && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    📅 {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                                {task.due_time && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200">
                                    🕐 {task.due_time}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-3 flex flex-wrap gap-2">
                              {/* Creador de la tarea */}
                              {(() => {
                                const creator = members.find(m => m.user_id === task.created_by);
                                if (creator) {
                                  return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      👤 Creado por: {getMemberDisplayName(creator)}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Asignados */}
                              {task.assigned_to.map((memberId) => {
                                const member = members.find(m => m.user_id === memberId);
                                if (!member) return null;
                                
                                return (
                                  <span 
                                    key={memberId}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                  >
                                    ✅ {getMemberDisplayName(member)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Botón eliminar tarea - solo visible para el creador */}
                      {task.created_by === user?.id && (
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title, task)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Check className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay tareas familiares</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Agrega tareas y asígnalas a miembros de la familia.
                </p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Agregar Tarea Familiar
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* No Group State */
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tienes grupos familiares
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Crea tu primer grupo familiar para comenzar a organizar tareas y responsabilidades.
          </p>
          <button
            onClick={() => setShowGroupForm(true)}
            className="inline-flex items-center mx-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-5 w-5 mr-1" />
            Crear Grupo Familiar
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Crear Grupo Familiar
              </h3>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Grupo
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ej. Familia García"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Crear Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invitar Miembro
              </h3>
            </div>
            
            <form onSubmit={handleInviteMember} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email del Usuario
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol en el Grupo
                  </label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as InvitationRole)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {(Object.keys(INVITATION_ROLE_LABELS) as InvitationRole[]).map((role) => (
                      <option key={role} value={role}>
                        {INVITATION_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Agregar Tarea Familiar
              </h3>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título de la Tarea
                  </label>
                  <input
                    type="text"
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ej. Recoger niños del colegio"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Detalles adicionales de la tarea..."
                  />
                </div>
                
                <div>
                  <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Límite (Opcional)
                  </label>
                  <input
                    type="date"
                    id="taskDueDate"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="taskDueTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horario (Opcional)
                  </label>
                  <input
                    type="time"
                    id="taskDueTime"
                    value={newTask.due_time}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_time: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ej. 15:30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asignar a Miembros
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {members.length > 0 ? (
                      members.map((member) => (
                        <div key={member.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`member-${member.id}`}
                            checked={newTask.assigned_to.includes(member.user_id)}
                            onChange={(e) => handleAssignmentChange(member.user_id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`member-${member.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {getMemberDisplayName(member)} ({getMemberRoleLabel(member)})
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay miembros para asignar. Invita miembros primero.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Agregar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Family;