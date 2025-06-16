/*
  # Crear tablas para datos compartidos

  1. Nuevas Tablas
    - `shared_tasks`
      - `id` (uuid, clave primaria)
      - `group_id` (uuid, referencia a family_groups)
      - `title` (texto)
      - `description` (texto, opcional)
      - `assigned_to` (uuid[], ids de usuarios asignados)
      - `due_date` (timestamp, opcional)
      - `completed` (booleano)
      - `created_at` (timestamp)
      - `created_by` (uuid, referencia a auth.users)

    - `shared_expenses`
      - `id` (uuid, clave primaria)
      - `group_id` (uuid, referencia a family_groups)
      - `description` (texto)
      - `amount` (numeric)
      - `date` (date)
      - `category` (texto)
      - `paid_by` (uuid, referencia a auth.users)
      - `split_between` (uuid[], ids de usuarios)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para permitir acceso solo a miembros del grupo
*/

-- Crear tabla de tareas compartidas
CREATE TABLE IF NOT EXISTS shared_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid[] NOT NULL,
  due_date timestamptz,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Crear tabla de gastos compartidos
CREATE TABLE IF NOT EXISTS shared_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  paid_by uuid REFERENCES auth.users(id) NOT NULL,
  split_between uuid[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE shared_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para shared_tasks
CREATE POLICY "Miembros pueden ver tareas del grupo"
  ON shared_tasks
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_tasks.group_id
    )
  );

CREATE POLICY "Miembros pueden crear y actualizar tareas"
  ON shared_tasks
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_tasks.group_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_tasks.group_id
    )
  );

-- Políticas para shared_expenses
CREATE POLICY "Miembros pueden ver gastos del grupo"
  ON shared_expenses
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_expenses.group_id
    )
  );

CREATE POLICY "Miembros pueden crear y actualizar gastos"
  ON shared_expenses
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_expenses.group_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_expenses.group_id
    )
  );