import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useSession } from '@clerk/clerk-react';
import type { UserResource } from '@clerk/types';
import { supabase } from '../lib/supabase';
import { UserProfile, UpdateProfileData, FamilyRole, AvatarIcon } from '../types/database';
import { logger } from '../lib/logger';

type AuthContextType = {
  user: UserResource | null | undefined; // Clerk user
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
  isSignedIn: boolean;
  // Compatibility methods for old components
  signUp?: () => Promise<void>;
  signIn?: () => Promise<void>;
  resetPassword?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut, getToken } = useClerkAuth();
  const { session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Sync Clerk user with Supabase database
  const syncUserProfile = useCallback(async (clerkUser: UserResource | null | undefined) => {
    if (!clerkUser) {
      setUserProfile(null);
      return;
    }

    logger.log('📝 Syncing user profile with Supabase for:', clerkUser.id);
    
    try {
      // Check if user exists in Supabase
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUser.id)
        .maybeSingle();

      if (selectError) {
        logger.warn('⚠️ Error checking existing user:', selectError);
        throw selectError;
      }

      const profileData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.fullName || clerkUser.firstName + ' ' + clerkUser.lastName || null,
        username: clerkUser.username || null,
        display_name: clerkUser.fullName || clerkUser.firstName || null,
        family_role: 'member' as FamilyRole,
        avatar_icon: 'user' as AvatarIcon,
        avatar_url: clerkUser.imageUrl || null,
        updated_at: new Date().toISOString(),
      };

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: profileData.email,
            name: profileData.name,
            avatar_url: profileData.avatar_url,
            updated_at: profileData.updated_at,
          })
          .eq('id', clerkUser.id)
          .select('*')
          .single();

        if (updateError) {
          logger.warn('⚠️ Error updating user profile:', updateError);
          throw updateError;
        }

        setUserProfile(updatedUser);
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            ...profileData,
            created_at: new Date().toISOString(),
          }])
          .select('*')
          .single();

        if (insertError) {
          logger.warn('⚠️ Error creating user profile:', insertError);
          throw insertError;
        }

        setUserProfile(newUser);
      }

      logger.log('✅ User profile synced successfully');
    } catch (error) {
      logger.warn('⚠️ Error syncing user profile:', error);
      setError(error instanceof Error ? error.message : 'Error syncing profile');
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    if (!user) throw new Error('No hay usuario autenticado');

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      setUserProfile(updatedProfile);
      logger.log('✅ Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sign out function
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await clerkSignOut();
      setUserProfile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clerkSignOut]);

  // Configure Supabase with Clerk user context
  useEffect(() => {
    const configureSupabase = async () => {
      if (user) {
        try {
          // Set the current user ID in the Supabase context for RLS
          await supabase.rpc('set_config', {
            setting_name: 'app.current_user_id',
            setting_value: user.id,
            is_local: false
          });
          logger.log('✅ Supabase configured with Clerk user ID');
        } catch (error) {
          // For now, continue without RLS context - basic functionality will work
          logger.warn('⚠️ RLS context function not available, proceeding without it:', error);
        }
      }
    };

    if (isLoaded) {
      setLoading(false);
      configureSupabase();
      
      if (user) {
        syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
    }
  }, [user, isLoaded, session, getToken, syncUserProfile]);

  const value = {
    user,
    userProfile,
    loading: loading || !isLoaded,
    error,
    signOut,
    updateProfile,
    clearError,
    isSignedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};