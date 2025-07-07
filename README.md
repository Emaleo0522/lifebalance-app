# LifeBalance App

Aplicación integral para gestión económica familiar, organización personal y control de tiempo.

## Características

- 🏠 **Gestión Familiar**: Organiza actividades y tareas familiares
- 💰 **Finanzas**: Control de gastos, ingresos y presupuestos familiares
- 📅 **Calendario**: Planificación y organización de eventos
- 🎯 **Modo Enfoque**: Herramientas de productividad y gestión del tiempo
- 📊 **Dashboard**: Resumen general de tu economía y organización
- ⚙️ **Configuración**: Personalización completa de la aplicación

## Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Herramientas**: Vite, ESLint, Vitest
- **PWA**: Service Worker con Workbox

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/lifebalance-app.git
cd lifebalance-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Variables de Entorno

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la build
- `npm run test` - Ejecutar tests
- `npm run lint` - Verificar código con ESLint
- `npm run type-check` - Verificar tipos TypeScript

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

