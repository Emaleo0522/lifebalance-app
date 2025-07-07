/*
  # Habilitar capacidades de tiempo real
  
  Este script habilita la replicación en tiempo real para las tablas del sistema familiar
  para permitir sincronización automática entre dispositivos.
*/

-- Habilitar replicación en tiempo real para las tablas familiares
ALTER PUBLICATION supabase_realtime ADD TABLE family_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE shared_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE shared_expenses;