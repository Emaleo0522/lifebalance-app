/*
  # Crear tablas para grupos familiares y miembros

  1. Nuevas Tablas
    - `family_groups`
      - `id` (uuid, clave primaria)
      - `name` (texto, nombre del grupo)
      - `created_at` (timestamp)
      - `owner_id` (uuid, referencia a auth.users)
    
    - `family_members`
      - `id` (uuid, clave primaria)
      - `group_id` (uuid, referencia a family_groups)
      - `user_id` (uuid, referencia a auth.users)
      - `role` (texto, rol en la familia)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para permitir acceso solo a miembros del grupo
*/

-- Crear tabla de grupos familiares
CREATE TABLE IF NOT EXISTS family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Crear tabla de miembros
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Habilitar RLS
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Políticas para family_groups
CREATE POLICY "Usuarios pueden ver sus grupos familiares"
  ON family_groups
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = family_groups.id
    ) OR auth.uid() = owner_id
  );

CREATE POLICY "Propietarios pueden modificar sus grupos"
  ON family_groups
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Políticas para family_members
CREATE POLICY "Miembros pueden ver otros miembros del grupo"
  ON family_members
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = family_members.group_id
    )
  );

CREATE POLICY "Propietarios pueden gestionar miembros"
  ON family_members
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id 
      FROM family_groups 
      WHERE id = family_members.group_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id 
      FROM family_groups 
      WHERE id = family_members.group_id
    )
  );