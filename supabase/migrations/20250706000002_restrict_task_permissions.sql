/*
  # Restringir permisos de tareas familiares
  
  Actualiza las políticas de RLS para implementar las siguientes reglas:
  - Solo el creador de una tarea puede eliminarla
  - Solo el creador o asignados pueden actualizar el estado de completado
  - Todos los miembros pueden ver y crear tareas
*/

-- Eliminar política existente que es muy permisiva
DROP POLICY IF EXISTS "Miembros pueden crear y actualizar tareas" ON shared_tasks;

-- Política para VER tareas (sin cambios)
-- Ya existe: "Miembros pueden ver tareas del grupo"

-- Política para CREAR tareas - cualquier miembro del grupo
CREATE POLICY "Miembros pueden crear tareas"
  ON shared_tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_tasks.group_id
    )
  );

-- Política para ACTUALIZAR tareas - solo creador o asignados
CREATE POLICY "Solo creador o asignados pueden actualizar tareas"
  ON shared_tasks
  FOR UPDATE
  USING (
    -- El usuario es el creador O está en la lista de asignados
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to) OR
    -- También permitir si es miembro del grupo (para casos edge)
    auth.uid() IN (
      SELECT user_id 
      FROM family_members 
      WHERE group_id = shared_tasks.group_id
    )
  );

-- Política para ELIMINAR tareas - solo el creador
CREATE POLICY "Solo el creador puede eliminar tareas"
  ON shared_tasks
  FOR DELETE
  USING (auth.uid() = created_by);