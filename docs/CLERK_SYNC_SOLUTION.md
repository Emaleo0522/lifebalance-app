# Solución de Sincronización Clerk-Supabase

## Problema Identificado (08/08/2025)

Se identificó un problema de sincronización entre los user IDs de Clerk y los registros en Supabase:

- **Clerk enviaba**: `user_30rGH9vf6snyFY1xe4ohbuYMWr2` 
- **Base de datos tenía**: `user_30r6H9vf6snyFYlxe4ohbuYMWr2`
- **Diferencia**: Clerk incluye un `1` adicional en el ID

## Síntomas

- Errores 22P02 "invalid input syntax for type uuid" (aunque no eran problemas UUID reales)
- Errores de foreign key constraint al crear deudas/transacciones
- Usuario aparece como "nuevo" aunque ya existía en la BD

## Solución Aplicada

### 1. Identificación del Problema
```bash
python3 debug_schema.py  # Script para identificar discrepancias
```

### 2. Corrección de Sincronización
Se actualizó el registro en la base de datos para usar el ID correcto de Clerk:

```sql
-- Eliminar registro con ID incorrecto
DELETE FROM users WHERE id = 'user_30r6H9vf6snyFYlxe4ohbuYMWr2';

-- Crear registro con ID correcto de Clerk
INSERT INTO users (id, email, family_role, avatar_icon) 
VALUES ('user_30rGH9vf6snyFY1xe4ohbuYMWr2', 'emaleo0522@gmail.com', 'member', 'user');
```

### 3. Verificación
- ✅ Deudas se crean correctamente
- ✅ Transacciones se crean correctamente  
- ✅ No más errores de foreign key

## Prevención Futura

El sistema de sincronización automática en `AuthContextClerk.tsx` debería manejar estos casos, pero para usuarios existentes puede ser necesario ejecutar scripts de migración.

## Scripts de Utilidad

- `debug_schema.py` - Diagnostica problemas de sincronización
- `check_user_data.py` - Verifica estado de usuarios en BD

## Fecha de Resolución
08 de Agosto, 2025 - 14:30 GMT