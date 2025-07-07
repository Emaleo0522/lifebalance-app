export type FamilyGroup = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
};

export type FamilyMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
  users?: {
    email: string;
    name?: string | null;
    display_name?: string | null;
    family_role?: FamilyRole;
    avatar_icon?: AvatarIcon;
  };
};

export type SharedTask = {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  assigned_to: string[];
  due_date?: string;
  due_time?: string; // Horario opcional para la tarea
  completed: boolean;
  created_at: string;
  created_by: string;
};

export type SharedExpense = {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  paid_by: string;
  split_between: string[];
  created_at: string;
};

// Tipos para los roles familiares
export type FamilyRole = 
  | 'father'    // Padre
  | 'mother'    // Madre
  | 'son'       // Hijo
  | 'daughter'  // Hija
  | 'grandfather' // Abuelo
  | 'grandmother' // Abuela
  | 'member';   // Miembro genérico

// Tipos para los iconos de avatar
export type AvatarIcon = 
  | 'user'      // 👤 Usuario genérico
  | 'father'    // 👨 Padre
  | 'mother'    // 👩 Madre
  | 'boy'       // 👦 Hijo
  | 'girl'      // 👧 Hija
  | 'elderly-man'    // 👴 Abuelo
  | 'elderly-woman'  // 👵 Abuela
  | 'star'      // ⭐ Estrella
  | 'crown'     // 👑 Corona
  | 'heart'     // ❤️ Corazón
  | 'home'      // 🏠 Casa
  | 'work'      // 💼 Trabajo
  | 'student'   // 🎓 Estudiante
  | 'sports'    // 🏃‍♂️ Deportes
  | 'creative'  // 🎨 Creativo
  | 'book'      // 📚 Lectura
  | 'music'     // 🎵 Música
  | 'game'      // 🎮 Juegos
  | 'travel'    // ✈️ Viajes
  | 'cook'      // 👨‍🍳 Cocina
  | 'tech';     // 💻 Tecnología

// Perfil de usuario extendido
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  display_name?: string;
  family_role: FamilyRole;
  avatar_icon: AvatarIcon;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

// Datos para actualizar perfil
export interface UpdateProfileData {
  name?: string;
  username?: string;
  display_name?: string;
  family_role?: FamilyRole;
  avatar_icon?: AvatarIcon;
  avatar_url?: string;
}

// Datos para registro con perfil
export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  username?: string;
  display_name?: string;
  family_role?: FamilyRole;
  avatar_icon?: AvatarIcon;
}

// Mapeo de roles a etiquetas en español
export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  father: 'Padre',
  mother: 'Madre', 
  son: 'Hijo',
  daughter: 'Hija',
  grandfather: 'Abuelo',
  grandmother: 'Abuela',
  member: 'Miembro'
};

// Mapeo de iconos a emojis/símbolos
export const AVATAR_ICON_SYMBOLS: Record<AvatarIcon, string> = {
  user: '👤',
  father: '👨',
  mother: '👩',
  boy: '👦',
  girl: '👧',
  'elderly-man': '👴',
  'elderly-woman': '👵',
  star: '⭐',
  crown: '👑',
  heart: '❤️',
  home: '🏠',
  work: '💼',
  student: '🎓',
  sports: '🏃‍♂️',
  creative: '🎨',
  book: '📚',
  music: '🎵',
  game: '🎮',
  travel: '✈️',
  cook: '👨‍🍳',
  tech: '💻'
};

// Mapeo de iconos a etiquetas
export const AVATAR_ICON_LABELS: Record<AvatarIcon, string> = {
  user: 'Usuario',
  father: 'Padre',
  mother: 'Madre',
  boy: 'Niño',
  girl: 'Niña',
  'elderly-man': 'Abuelo',
  'elderly-woman': 'Abuela',
  star: 'Estrella',
  crown: 'Corona',
  heart: 'Corazón',
  home: 'Hogar',
  work: 'Trabajo',
  student: 'Estudiante',
  sports: 'Deportes',
  creative: 'Creativo',
  book: 'Lectura',
  music: 'Música',
  game: 'Juegos',
  travel: 'Viajes',
  cook: 'Cocina',
  tech: 'Tecnología'
};