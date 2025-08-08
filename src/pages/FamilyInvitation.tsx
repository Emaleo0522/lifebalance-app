import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, Mail, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContextClerk';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface InvitationData {
  id: string;
  email: string;
  group_id: string;
  role: string;
  family_group_name: string;
  inviter_name: string;
  created_at: string;
  expires_at: string;
  status: string;
}

const FamilyInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  
  // Datos de registro
  const [registrationData, setRegistrationData] = useState({
    name: '',
    display_name: '',
    password: '',
    confirmPassword: '',
  });
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de invitación no válido');
      setLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      
      // Obtener información de la invitación
      const { data, error } = await supabase
        .rpc('get_invitation_by_token', { token });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setError('La invitación no existe o ha expirado');
        return;
      }

      const invitationData = data[0] as InvitationData;
      setInvitation(invitationData);

      // Marcar como clickeada
      await supabase.rpc('mark_invitation_clicked', { token });

      // Si el usuario está logueado, verificar si es el correcto
      if (user) {
        const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
        if (userEmail !== invitationData.email) {
          setError('Esta invitación es para otro email. Por favor, inicia sesión con la cuenta correcta.');
          return;
        }
      }

    } catch (error) {
      console.error('Error loading invitation:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !user) return;

    try {
      setAccepting(true);
      
      // Agregar usuario al grupo familiar
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          group_id: invitation.group_id,
          user_id: user.id,
          role: invitation.role
        }]);

      if (memberError) {
        throw memberError;
      }

      // Marcar invitación como aceptada
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        throw updateError;
      }

      // Redirigir al grupo familiar
      navigate('/family?joined=true');

    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setAccepting(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;

    // Validaciones
    if (!registrationData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!registrationData.display_name.trim()) {
      setError('El nombre para mostrar es requerido');
      return;
    }

    if (registrationData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setAccepting(true);
      
      // With Clerk, redirect to sign up with email pre-filled
      navigate(`/auth?mode=sign-up&email=${encodeURIComponent(invitation.email)}`);

      // La aceptación de la invitación se manejará en AuthCallback
      // después de que el usuario confirme su email
      
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setAccepting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      'admin': 'Administrador',
      'member': 'Miembro',
      'child': 'Hijo/a'
    };
    return labels[role as keyof typeof labels] || 'Miembro';
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Menos de 1 hora';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando invitación...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error en la invitación
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invitación al grupo familiar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Te han invitado a unirte a un grupo familiar en LifeBalance
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Grupo:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {invitation.family_group_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Invitado por:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {invitation.inviter_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Rol:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getRoleLabel(invitation.role)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                Expira en:
              </span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {getTimeRemaining(invitation.expires_at)}
              </span>
            </div>
          </div>
        </div>

        {user ? (
          (user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress) === invitation.email ? (
            <div className="space-y-4">
              <div className="flex items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Sesión iniciada como {user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              
              <button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uniéndose...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Unirme al grupo familiar
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Esta invitación es para {invitation.email}
                </span>
              </div>
              
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Iniciar sesión con la cuenta correcta
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {!showRegistration ? (
              <>
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Invitación para: {invitation.email}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/auth?email=${encodeURIComponent(invitation.email)}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Iniciar sesión
                  </button>
                  
                  <button
                    onClick={() => setShowRegistration(true)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Crear cuenta nueva
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ¿Cómo quieres que te llamen?
                  </label>
                  <input
                    type="text"
                    value={registrationData.display_name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre para mostrar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={registrationData.confirmPassword}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Confirma tu contraseña"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRegistration(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={accepting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {accepting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </>
                    ) : (
                      'Crear cuenta'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyInvitation;