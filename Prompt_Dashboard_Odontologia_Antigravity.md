# Prompt para Google Antigravity — Dashboard de Administración (Sitio Odontológico)

## 1. Contexto y objetivo del proyecto

Necesito que desarrolles una **aplicación web full-stack** que funcione como **panel de administración (backoffice)** para el sitio de un profesional odontólogo que ofrece cursos, equipamiento/software y una librería digital de archivos STL.

El panel debe permitir:
- Visualizar y gestionar (crear, editar, eliminar) el catálogo de **cursos** y sus **ediciones/cohortes** (fechas, dictantes, cupos).
- Visualizar y gestionar (crear, editar, eliminar) el catálogo de **productos** (equipamiento/software) y sus precios.
- Visualizar y gestionar (crear, editar, eliminar) el catálogo de la **librería digital** (STL, aditamentos, accesorios) y sus precios/ofertas.
- Visualizar (solo lectura, **sin permitir modificación ni eliminación**) la tabla de **leads/conversaciones**, generada automáticamente por un agente de IA que procesa consultas recibidas por Instagram y Telegram.
- Gestionar el **login con roles** (administrador / solo lectura) y permitir el **cambio de contraseña** desde la propia interfaz.

El entorno de desarrollo será **local en mi PC** en una primera etapa. Luego se debe dejar preparado el proyecto para **exportarlo a un repositorio de GitHub** y desplegarlo en un **VPS con Ubuntu**, donde correrá en arquitectura **cliente-servidor** junto con la base de datos PostgreSQL (todo en el mismo VPS).

---

## 2. Stack tecnológico solicitado

- **Frontend:** Next.js 14+ (App Router) con TypeScript, TailwindCSS y componentes shadcn/ui.
- **Backend:** API routes / Route Handlers del propio Next.js (o un servicio Node.js + Express separado si lo consideras más prolijo para el despliegue en VPS).
- **ORM:** Prisma, apuntando a PostgreSQL.
- **Base de datos:** PostgreSQL (esquema real detallado en la sección 4; ya existe y **no debe destruirse**, solo ampliarse con lo necesario para autenticación).
- **Autenticación:** JWT (httpOnly cookies) o NextAuth con Credentials Provider, contraseñas hasheadas con **bcrypt**. No usar autenticación de terceros (Google/Microsoft), debe ser 100% contra la tabla de usuarios en Postgres.
- **Validación:** Zod tanto en frontend (formularios) como en backend (payloads de API).
- **Gestión de estado/datos remotos:** TanStack Query (React Query) para el fetching y cacheo de datos de las tablas.
- **Tablas:** TanStack Table (o similar) para las DataTables con orden, filtro y paginación.
- **Control de versiones:** Git, con estructura de proyecto lista para subir a GitHub (incluir `.gitignore`, `.env.example`, y README con instrucciones de instalación y despliegue).

> Nota para Antigravity: si durante el desarrollo detectás una alternativa técnica claramente superior para algún punto puntual (por ejemplo, librería de tablas o de formularios), proponela, pero mantené la base Next.js + TypeScript + Postgres + Prisma como columna vertebral del proyecto.

---

## 3. Arquitectura y flujo de despliegue

1. **Fase local:** el proyecto debe correr con `npm run dev` contra una instancia de Postgres local (o Docker), usando variables de entorno (`.env.local`) para la cadena de conexión.
2. **Fase de exportación:** dejar el repositorio listo para `git init` / `git remote add origin` y push a GitHub, con `.env.example` documentado y sin credenciales reales versionadas.
3. **Fase de producción (VPS Ubuntu):**
   - La app y la base de datos Postgres corren en el mismo servidor.
   - Incluir instrucciones (o un `docker-compose.yml`) para levantar la app en modo producción (`npm run build && npm run start`) detrás de un reverse proxy (Nginx) con HTTPS (Let's Encrypt/Certbot).
   - Documentar el proceso de migración de base de datos en producción (`prisma migrate deploy`).
   - Considerar uso de PM2 (o systemd) para mantener el proceso Node vivo y con reinicio automático.

---

## 4. Esquema de base de datos PostgreSQL (ya existente)

```sql
-- 1. productos (Catálogo de equipamiento/software principal)
productos
- id (SERIAL PRIMARY KEY)
- producto (VARCHAR)
- descripcion_breve (TEXT)
- precio (VARCHAR)
- contacto (VARCHAR)
- ultima_actualizacion (TIMESTAMP)

-- 2. catalogo_digital (Librerías STL, aditamentos y accesorios)
catalogo_digital
- id (SERIAL PRIMARY KEY)
- producto (VARCHAR)
- precio_actual (NUMERIC)
- precio_original (NUMERIC)
- moneda (VARCHAR)
- en_oferta (BOOLEAN)
- gratis (BOOLEAN)
- notas (TEXT)

-- 3. cursos (Master de programas académicos)
cursos
- id (SERIAL PRIMARY KEY)
- codigo (VARCHAR, UNIQUE)
- nombre_del_curso (VARCHAR)
- tipo_modalidad (TEXT)
- nivel (VARCHAR)
- carga_horaria_duracion (VARCHAR)
- contenido_resumido (TEXT)
- incluye (TEXT)
- forma_de_pago (VARCHAR)
- contacto_inscripcion (VARCHAR)

-- 4. curso_ediciones (Detalle de fechas/cohortes - Relación 1 a N con cursos)
curso_ediciones
- id (SERIAL PRIMARY KEY)
- curso_id (INTEGER, FK -> cursos.id)
- nombre_edicion (VARCHAR)
- dictante (VARCHAR)
- fecha_inicio (DATE)
- fechas_especificas (TEXT)
- participantes (VARCHAR)
- precio (VARCHAR)
- estado (VARCHAR)

-- 5. leads_conversaciones (Registro de contactos y prospectos - SOLO LECTURA)
leads_conversaciones
- id (SERIAL PRIMARY KEY)
- channel (VARCHAR)
- contact_name (VARCHAR)
- phone (VARCHAR)
- telegram_id (VARCHAR)
- instagram_id (VARCHAR)
- categoria_interes (VARCHAR)
- detalle_interes (TEXT)
- requiere_followup (BOOLEAN)
- resumen_ejecutivo (TEXT)
- fecha_mensaje (DATE)
- hora_mensaje (TIME)
- cantidad_mensajes (INTEGER)
- conversation_id (VARCHAR)
```

### Tabla nueva a crear: `usuarios` (autenticación)

Se debe generar esta tabla, ya que actualmente no existe:

```sql
usuarios
- id (SERIAL PRIMARY KEY)
- nombre (VARCHAR)
- email (VARCHAR, UNIQUE, NOT NULL)
- password_hash (VARCHAR, NOT NULL)      -- generado con bcrypt (cost factor 10-12)
- rol (VARCHAR NOT NULL DEFAULT 'lectura')  -- valores permitidos: 'admin' | 'lectura'
- activo (BOOLEAN DEFAULT TRUE)
- creado_en (TIMESTAMP DEFAULT NOW())
- ultimo_login (TIMESTAMP)
```

**Sobre el cifrado de contraseñas:** hashear siempre con bcrypt (o argon2 como alternativa más moderna) directamente en el backend de la aplicación Next.js/Node. **No es necesario ni recomendable delegar el cifrado a n8n**: n8n es una herramienta de automatización/orquestación, no un servicio de autenticación, y sumar esa dependencia agrega latencia y una superficie de fallo innecesaria para un proceso que debe ser síncrono (login). Dejar a n8n exclusivamente su rol actual (agente de IA que carga leads), sin tocar la lógica de autenticación del panel.

---

## 5. Requerimientos funcionales por sección

### 5.1 Pantalla principal / Home
- Al ingresar (post-login), la primera vista debe ser el **dashboard de Leads** (`leads_conversaciones`), con:
  - Filtros rápidos por `requiere_followup` (sí/no) y `channel` (Instagram/Telegram).
  - Orden por `fecha_mensaje` / `hora_mensaje` descendente por defecto.
  - Todos los campos visibles, tabla **100% de solo lectura** (sin botones de editar/eliminar, sin acceso a endpoints de escritura para esta tabla salvo lectura).
- Menú lateral o superior de navegación hacia: **Cursos**, **Productos/Equipamiento**, **Librería Digital**, y (solo para rol admin) **Gestión de Usuarios / Cambio de contraseña**.

### 5.2 Módulo Cursos
- Vista maestro-detalle: tabla principal de `cursos`, y al seleccionar un curso, tabla anidada/expandible de sus `curso_ediciones`.
- CRUD completo (alta, edición, eliminación) tanto de cursos como de ediciones — **solo habilitado para rol admin**.
- Formulario modal para crear/editar, con validación de campos obligatorios (`codigo` único, `nombre_del_curso`, etc.).
- Posibilidad de actualizar fechas de ediciones existentes y cambiar su `estado` (por ejemplo: abierta, cerrada, finalizada).
- Confirmación (modal de confirmación) antes de eliminar un curso o edición.

### 5.3 Módulo Productos (equipamiento/software)
- Tabla con búsqueda y orden por `producto`, `precio`, `ultima_actualizacion`.
- CRUD completo — solo admin. Al editar, actualizar automáticamente `ultima_actualizacion` con la fecha/hora actual.

### 5.4 Módulo Librería Digital (`catalogo_digital`)
- Tabla con filtros por `en_oferta` y `gratis`.
- CRUD completo — solo admin, incluyendo edición de `precio_actual`, `precio_original`, `moneda`, y toggles para `en_oferta`/`gratis`.

### 5.5 Gestión de usuarios y login
- Pantalla de login (email + contraseña) contra la tabla `usuarios`.
- Dos roles con permisos diferenciados:
  - **admin**: acceso total de lectura/escritura a cursos, productos y librería; lectura de leads; puede gestionar usuarios.
  - **lectura**: acceso de solo lectura a todas las secciones (incluidos cursos/productos/librería, sin botones de edición visibles ni endpoints habilitados).
- Pantalla de "Mi cuenta" para que cualquier usuario logueado pueda **cambiar su propia contraseña** (requiere confirmar la contraseña actual).
- (Opcional, sugerido) Pantalla exclusiva de admin para dar de alta nuevos usuarios y asignarles rol.

---

## 6. Requerimientos no funcionales

- **Diseño responsive**: prioridad a la experiencia de escritorio (uso principal), pero totalmente funcional en dispositivos móviles, especialmente para: consultar/filtrar leads y realizar ediciones rápidas de cursos/productos desde el celular.
- **Seguridad**:
  - Todas las rutas de la API deben validar el rol del usuario en el backend (no confiar solo en ocultar botones en el frontend).
  - Protección CSRF y uso de cookies httpOnly + secure en producción.
  - Rate limiting básico en el endpoint de login para mitigar fuerza bruta.
- **UX/UI**: interfaz limpia, moderna, con feedback claro (toasts/notificaciones) ante altas, ediciones, eliminaciones y errores.
- **Manejo de errores**: mensajes claros ante fallos de conexión a la base o validación fallida.
- **Documentación**: README con instrucciones claras de instalación local, variables de entorno necesarias, comandos de build/deploy, y pasos de migración de Prisma.

---

## 7. Entregables esperados

1. Proyecto Next.js completo y funcional localmente contra Postgres.
2. Esquema de Prisma (`schema.prisma`) reflejando las tablas existentes + la nueva tabla `usuarios`, junto con las migraciones correspondientes.
3. Sistema de autenticación funcional con los dos roles.
4. CRUD completo para `cursos`, `curso_ediciones`, `productos` y `catalogo_digital`.
5. Vista de solo lectura para `leads_conversaciones` con filtros.
6. Diseño responsive validado en al menos dos breakpoints (desktop y mobile).
7. README con instrucciones de instalación local y guía de despliegue en VPS Ubuntu (Nginx + PM2/systemd + Postgres + Certbot).
8. Estructura de repositorio lista para push a GitHub (`.gitignore`, `.env.example`).
