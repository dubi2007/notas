@AGENTS.md

Actúa como un arquitecto de software senior y desarrollador fullstack experto en Next.js (App Router), Supabase, TipTap y diseño de productos SaaS escalables.

Tu tarea es diseñar y construir una aplicación web completa tipo Notion, enfocada en estudiantes de ingeniería, optimizada para velocidad, simplicidad y bajo nivel de fricción (UX rápida sin interrupciones).

No quiero un ejemplo simple. Quiero un sistema real, modular, escalable, reutilizable y listo para producción.

━━━━━━━━━━━━━━━━━━━━━━━
🧠 VISIÓN DEL PRODUCTO
━━━━━━━━━━━━━━━━━━━━━━━

Construir una aplicación de notas académicas donde:
- El usuario pueda empezar a escribir inmediatamente (sin login obligatorio)
- El login sea opcional y no bloquee la experiencia
- El sistema sea rápido, limpio y sin distracciones
- Permita organizar apuntes por cursos/carpetas
- Soporte contenido enriquecido (texto, imágenes, código)

Inspiración:
- Notion (estructura)
- Obsidian (rapidez)
- Google Docs (edición fluida)

━━━━━━━━━━━━━━━━━━━━━━━
🏗️ ARQUITECTURA GENERAL
━━━━━━━━━━━━━━━━━━━━━━━

Define una arquitectura profesional con:

- Next.js App Router (server + client components correctamente separados)
- Capas bien definidas:
  - UI (componentes)
  - lógica (hooks)
  - servicios (API / Supabase)
- Patrón modular y escalable
- Manejo de estado híbrido:
  - local (editor, UI)
  - remoto (Supabase)
- Estrategia offline-first:
  - uso de localStorage o IndexedDB
  - sincronización posterior

━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTENTICACIÓN (MÓDULO REUTILIZABLE)
━━━━━━━━━━━━━━━━━━━━━━━

Diseñar un sistema de autenticación desacoplado y reutilizable:

- Crear módulo `/lib/auth` o `/services/auth`
- Funciones:
  - register(email, password)
  - login(email, password)
  - logout()
  - getCurrentUser()
- Manejo de sesión persistente

Implementar:
- Login con email/password (NO usar Google)
- Manejo de errores
- Estado global de usuario

━━━━━━━━━━━━━━━━━━━━━━━
🛡️ PROTECCIÓN DE RUTAS (MIDDLEWARE)
━━━━━━━━━━━━━━━━━━━━━━━

Implementar protección robusta usando middleware de Next.js:

- Crear `middleware.ts`
- Validar sesión con Supabase
- Redirigir si no está autenticado
- Permitir rutas públicas:
  - /login
  - /register

Además:
- Protección adicional en cliente (defensiva)
- Evitar acceso directo por URL

━━━━━━━━━━━━━━━━━━━━━━━
📁 MODELO DE DATOS (CON RLS + ÍNDICES)
━━━━━━━━━━━━━━━━━━━━━━━

Diseñar en Supabase:

Tabla: folders
- id (uuid, PK)
- user_id (uuid, FK auth.users)
- name (text)
- created_at (timestamp)

Tabla: notes
- id (uuid, PK)
- folder_id (uuid, FK folders)
- user_id (uuid, FK auth.users)
- title (text)
- content (jsonb)
- created_at
- updated_at

REQUISITOS OBLIGATORIOS:

1. Row Level Security (RLS):
- Activar RLS en todas las tablas
- Políticas:
  - SELECT: solo sus datos
  - INSERT: solo su user_id
  - UPDATE: solo sus registros
  - DELETE: solo sus registros

2. Índices (MUY IMPORTANTE):
- index en user_id
- index en folder_id
- index compuesto (user_id, folder_id)
- index para búsqueda (title)

3. Integridad:
- ON DELETE CASCADE en relaciones

━━━━━━━━━━━━━━━━━━━━━━━
🧠 EDITOR DE TEXTO (TIPTAP PRO)
━━━━━━━━━━━━━━━━━━━━━━━

Implementar editor avanzado con:

- StarterKit
- Image extension
- CodeBlock con syntax highlighting (lowlight)
- Soporte JSON como almacenamiento

Explicar:
- Configuración completa
- Extensiones usadas
- Manejo de estado del editor
- Serialización a JSON

━━━━━━━━━━━━━━━━━━━━━━━
💾 AUTOSAVE INTELIGENTE
━━━━━━━━━━━━━━━━━━━━━━━

Implementar sistema robusto:

- Debounce (2–5 segundos)
- Evitar múltiples requests innecesarios
- Solo guardar si hay cambios reales
- Indicador visual:
  - “Guardando…”
  - “Guardado”

━━━━━━━━━━━━━━━━━━━━━━━
🖼️ SUBIDA DE IMÁGENES (STORAGE)
━━━━━━━━━━━━━━━━━━━━━━━

- Subida a Supabase Storage
- Generar URL pública
- Insertar automáticamente en TipTap
- Validar tamaño y tipo de archivo
- Manejo de errores

━━━━━━━━━━━━━━━━━━━━━━━
📁 SISTEMA DE CARPETAS
━━━━━━━━━━━━━━━━━━━━━━━

- CRUD completo
- Sidebar dinámico
- Selección activa
- Relación directa con notas

━━━━━━━━━━━━━━━━━━━━━━━
📝 GESTIÓN DE NOTAS
━━━━━━━━━━━━━━━━━━━━━━━

- CRUD completo
- Relación con carpetas
- Carga eficiente (lazy loading si es necesario)
- Estado sincronizado

━━━━━━━━━━━━━━━━━━━━━━━
🔍 BÚSQUEDA OPTIMIZADA
━━━━━━━━━━━━━━━━━━━━━━━

- Búsqueda por título con ilike
- Opcional: full-text search
- Uso de índices para optimización

━━━━━━━━━━━━━━━━━━━━━━━
🎨 UI/UX (ALTO NIVEL)
━━━━━━━━━━━━━━━━━━━━━━━

- Tailwind CSS
- Diseño tipo Notion:
  - Sidebar (carpetas)
  - Editor principal
- Responsive
- UX inmediata:
  - sin bloqueos
  - sin loaders innecesarios
  - interacción fluida

━━━━━━━━━━━━━━━━━━━━━━━
⚡ PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━

- Evitar re-renders innecesarios
- Memoización donde aplique
- Lazy loading de componentes pesados
- Separación de server/client components

━━━━━━━━━━━━━━━━━━━━━━━
📦 ENTREGA (OBLIGATORIO)
━━━━━━━━━━━━━━━━━━━━━━━

Generar:

1. Estructura completa del proyecto (carpetas reales)
2. Código funcional listo para copiar
3. SQL completo con:
   - tablas
   - RLS
   - índices
4. Módulo de autenticación reutilizable
5. Middleware de protección de rutas
6. Configuración completa de TipTap
7. Lógica de autosave
8. Integración con Supabase
9. Explicación clara de cada módulo
10. Instrucciones paso a paso para correr el proyecto

━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REGLAS
━━━━━━━━━━━━━━━━━━━━━━━

- No simplificar
- No dar pseudo-código
- Código modular y escalable
- Buenas prácticas reales de producción
- Separación clara de responsabilidades

Construye el proyecto paso a paso y valida cada parte antes de continuar.