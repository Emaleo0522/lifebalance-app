# Guía de Despliegue - LifeBalance App

## 🚀 Despliegue en Vercel

### Paso 1: Preparar el Repositorio

El proyecto ya está configurado y listo para despliegue. Los cambios han sido commiteados localmente.

### Paso 2: Subir a GitHub

Para subir el código a GitHub, necesitas autenticarte. Tienes varias opciones:

#### Opción A: Usar GitHub CLI
```bash
gh auth login
git push origin main
```

#### Opción B: Usar Token Personal
1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Crea un nuevo token con permisos de repositorio
3. Usa el token como contraseña:
```bash
git push https://tu-username:tu-token@github.com/Emaleo0522/mi-web-corregida.git main
```

#### Opción C: Cambiar a SSH
```bash
git remote set-url origin git@github.com:Emaleo0522/mi-web-corregida.git
git push origin main
```

### Paso 3: Configurar Vercel

1. **Conectar Repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Selecciona "mi-web-corregida"

2. **Configuración del Proyecto:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install --legacy-peer-deps
   ```

3. **Variables de Entorno:**
   Agrega estas variables en Vercel Dashboard:
   ```
   VITE_SUPABASE_URL=https://pqhlpfsdtgbldgbzatpf.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTI3NTksImV4cCI6MjA2NTY4ODc1OX0.enCSf9CBaqiX27caocl6b88AT6cBGO5b30ayEzNISzY
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxx
   ```

### Paso 4: Configuración de Dominio (Opcional)

Si tienes un dominio personalizado:
1. Ve a Project Settings → Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones

## 🛠️ Configuración Adicional

### PWA (Progressive Web App)
La aplicación está configurada como PWA y funcionará offline después del primer acceso.

### Supabase
Asegúrate de que tu proyecto de Supabase esté configurado correctamente:
- Row Level Security habilitado
- Políticas de seguridad configuradas
- Tablas migradas

### Monitoreo
- Los logs estarán disponibles en Vercel Dashboard
- Errores se capturan automáticamente
- Performance se monitorea en tiempo real

## 🔧 Troubleshooting

### Error de Build
Si el build falla:
1. Verifica que las variables de entorno estén configuradas
2. Revisa que el comando de instalación sea: `npm install --legacy-peer-deps`
3. Comprueba los logs de build en Vercel

### Error de Variables de Entorno
- Variables deben comenzar con `VITE_` para estar disponibles en el frontend
- Verifica que las URLs de Supabase sean correctas
- Asegúrate de que no haya espacios extra en las variables

### Error 404 en Rutas
El archivo `vercel.json` ya está configurado para manejar SPAs con React Router.

## 📝 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview de build local
npm run preview

# Tests
npm run test

# Linting
npm run lint
```

## 🚀 ¡Listo!

Una vez completados los pasos, tu aplicación estará disponible en:
- URL temporal de Vercel (ej: https://mi-web-corregida.vercel.app)
- Tu dominio personalizado (si lo configuraste)

La aplicación se re-desplegará automáticamente cada vez que hagas push a la rama main.