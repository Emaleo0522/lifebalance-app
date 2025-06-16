import React, { useState } from 'react';
import { Users, PlusCircle, Trash2, Edit2, Check, UserPlus, Mail } from 'lucide-react';
import { useFamilyGroup } from '../hooks/useFamilyGroup';

const Family: React.FC = () => {
  const {
    loading,
    groups,
    currentGroup,
    setCurrentGroup,
    members,
    tasks,
    createGroup,
    inviteMember,
    createTask,
    updateTask,
  } = useFamilyGroup();

  // State for forms
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Miembro');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: [] as string[],
    due_date: '',
  });

  // Handle create group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      const group = await createGroup(newGroupName.trim());
      if (group) {
        setNewGroupName('');
        setShowGroupForm(false);
      }
    }
  };

  // Handle invite member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      const success = await inviteMember(inviteEmail.trim(), inviteRole);
      if (success) {
        setInviteEmail('');
        setInviteRole('Miembro');
        setShowInviteForm(false);
        alert('Miembro invitado exitosamente');
      } else {
        alert('Error al invitar miembro. Verifica que el email esté registrado.');
      }
    }
  };

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      const task = await createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        assigned_to: newTask.assigned_to,
        due_date: newTask.due_date || undefined,
        completed: false,
      });
      
      if (task) {
        setNewTask({
          title: '',
          description: '',
          assigned_to: [],
          due_date: '',
        });
        setShowTaskForm(false);
      }
    }
  };

  // Handle task completion toggle
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed: !completed });
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
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
              className="btn btn-primary flex items-center justify-center"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              Crear Grupo Familiar
            </button>
          )}
          
          {currentGroup && (
            <>
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn btn-primary flex items-center justify-center"
              >
                <PlusCircle className="h-5 w-5 mr-1" />
                Agregar Tarea
              </button>
              
              <button
                onClick={() => setShowInviteForm(true)}
                className="btn btn-secondary flex items-center justify-center"
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
        <div className="card">
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
                    ? 'bg-primary-500 text-white'
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
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-500" />
              {currentGroup.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Members */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Miembros ({members.length})
                </h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-primary-200 font-semibold">
                        {member.users?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.users?.email || 'Usuario'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  
                  {members.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No hay miembros en este grupo aún.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Estadísticas
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tareas Totales</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{tasks.length}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tareas Completadas</p>
                    <p className="text-2xl font-semibold text-success-600 dark:text-success-400">
                      {tasks.filter(t => t.completed).length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tareas Pendientes</p>
                    <p className="text-2xl font-semibold text-warning-600 dark:text-warning-400">
                      {tasks.filter(t => !t.completed).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Check className="h-5 w-5 mr-2 text-success-500" />
              Tareas Familiares
            </h2>
            
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
                      task.completed ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id, task.completed)}
                            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <p className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {task.description}
                            </p>
                          )}
                          
                          {task.due_date && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                Vence: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.assigned_to.map((memberId) => {
                              const member = members.find(m => m.user_id === memberId);
                              if (!member) return null;
                              
                              return (
                                <span 
                                  key={memberId}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
                                >
                                  {member.users?.email?.split('@')[0] || 'Usuario'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <Check className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay tareas familiares</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Agrega tareas y asígnalas a miembros de la familia.
                </p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600"
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
        <div className="card text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tienes grupos familiares
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Crea tu primer grupo familiar para comenzar a organizar tareas y responsabilidades.
          </p>
          <button
            onClick={() => setShowGroupForm(true)}
            className="btn btn-primary flex items-center mx-auto"
          >
            <PlusCircle className="h-5 w-5 mr-1" />
            Crear Grupo Familiar
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Crear Grupo Familiar
              </h3>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="label">Nombre del Grupo</label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="input"
                    placeholder="ej. Familia García"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invitar Miembro
              </h3>
            </div>
            
            <form onSubmit={handleInviteMember} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="label">Email del Miembro</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="miembro@email.com"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    El usuario debe estar registrado en la aplicación
                  </p>
                </div>
                
                <div>
                  <label htmlFor="inviteRole" className="label">Rol</label>
                  <input
                    type="text"
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="input"
                    placeholder="ej. Padre, Hijo, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Agregar Tarea Familiar
              </h3>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="taskTitle" className="label">Título de la Tarea</label>
                  <input
                    type="text"
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="ej. Recoger niños del colegio"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="taskDescription" className="label">Descripción (opcional)</label>
                  <textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    placeholder="Agrega detalles sobre esta tarea"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="taskDueDate" className="label">Fecha Límite (opcional)</label>
                  <input
                    type="date"
                    id="taskDueDate"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="label">Asignar A</label>
                  <div className="mt-2 space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center">
                        <input
                          id={`member-${member.id}`}
                          type="checkbox"
                          checked={newTask.assigned_to.includes(member.user_id)}
                          onChange={(e) => handleAssignmentChange(member.user_id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`member-${member.id}`}
                          className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {member.users?.email?.split('@')[0] || 'Usuario'} ({member.role})
                        </label>
                      </div>
                    ))}
                    
                    {members.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Invita miembros al grupo para poder asignar tareas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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