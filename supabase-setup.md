# Configuración de Supabase - Paso a Paso

## 1. Crear las tablas necesarias

Ve a tu proyecto de Supabase → SQL Editor y ejecuta este script:

```sql
-- Crear tabla de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

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

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para family_groups
CREATE POLICY "Usuarios pueden ver sus grupos familiares"
  ON family_groups
  FOR SELECT
  TO authenticated
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
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Políticas para family_members
CREATE POLICY "Miembros pueden ver otros miembros del grupo"
  ON family_members
  FOR SELECT
  TO authenticated
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
  TO authenticated
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

-- Políticas para shared_tasks
CREATE POLICY "Miembros pueden ver tareas del grupo"
  ON shared_tasks
  FOR SELECT
  TO authenticated
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
  TO authenticated
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
  TO authenticated
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
  TO authenticated
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

-- Función para crear usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 2. Configurar autenticación

En Supabase → Authentication → Settings:

1. **Site URL**: Agrega tu URL de Vercel (ej: `https://tu-app.vercel.app`)
2. **Redirect URLs**: Agrega:
   - `https://tu-app.vercel.app`
   - `https://tu-app.vercel.app/auth`
   - `http://localhost:5173` (para desarrollo)

## 3. Verificar configuración

1. Ve a Authentication → Users para ver usuarios registrados
2. Ve a Table Editor para ver las tablas creadas
3. Prueba crear un usuario desde tu aplicación

## 4. Solución de problemas comunes

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto esté desplegado en Vercel

### Error: "Row Level Security"
- Verifica que las políticas RLS estén creadas
- Asegúrate de que el usuario esté autenticado

### Error: "Table doesn't exist"
- Ejecuta el script SQL completo en el SQL Editor
- Verifica que todas las tablas aparezcan en Table Editor

## 5. Próximos pasos

Una vez configurado:
1. Registra un usuario desde tu aplicación
2. Crea un grupo familiar
3. Invita miembros al grupo
4. Prueba crear tareas y gastos compartidos

¡Tu aplicación ya debería estar funcionando con Supabase!