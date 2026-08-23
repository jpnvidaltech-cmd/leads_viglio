# Pérez Giugovaz — Panel de Administración (Backoffice)

Este proyecto es un panel de administración full-stack desarrollado para la gestión de cursos, ediciones, productos, catálogo digital (STL) y seguimiento de leads para el sitio web del profesional odontólogo Dr. Pérez Giugovaz.

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 (App Router) con TypeScript, TailwindCSS v4.
- **Backend:** API Route Handlers integrados en Next.js.
- **Base de Datos / ORM:** PostgreSQL a través de Prisma ORM v6.
- **Autenticación:** NextAuth.js (Credentials Provider) con JWT en cookies httpOnly seguras.
- **Fetching de Datos:** TanStack Query (React Query) para caché y sincronización ágil en cliente.
- **Validaciones:** Zod en cliente y servidor.
- **Alineación de Estilo:** Paleta original de Pérez Giugovaz (Azul primario `#00578E`, Naranja de acento `#E78A1E`, Textos `#152841`), tipografías Montserrat/Inter y bordes de 16px.

---

## 💻 Instalación y Configuración Local

### Prerrequisitos
- Node.js (versión 18 o superior).
- npm (incluido con Node.js).
- Docker (opcional, para la base de datos).

### Pasos para iniciar el proyecto

1. **Instalar Dependencias:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configurar Variables de Entorno:**
   Copia el archivo `.env.example` y cámbialo a `.env`:
   ```bash
   cp .env.example .env
   ```
   *Nota: Por defecto está configurado para conectarse a un PostgreSQL local en el puerto 5432 con la base de datos `leads_db`.*

3. **Iniciar Base de Datos Local (con Docker):**
   Si tienes Docker instalado, ejecuta el contenedor con:
   ```bash
   docker compose up -d
   ```
   *Si no usas Docker, asegúrate de tener una base de datos PostgreSQL local corriendo e introduce su url en la variable `DATABASE_URL` en el archivo `.env`.*

4. **Sincronizar el Esquema de la Base de Datos:**
   Para crear la tabla de `usuarios` y el resto de tablas del esquema en la base de datos, ejecuta:
   ```bash
   npx prisma db push
   ```

5. **Insertar Datos de Prueba y Administrador Inicial (Seed):**
   Ejecuta el script de seed para insertar el usuario administrador:
   ```bash
   npx prisma db seed
   ```
   **Credenciales iniciales creadas:**
   - **Usuario:** `ingresa un email`
   - **Contraseña:** `genera tu contraseña`
   - **Rol:** `admin`

6. **Correr Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## 🚀 Despliegue en Servidor VPS (Ubuntu)

Sigue estos pasos para desplegar el proyecto en un VPS Ubuntu, alojando tanto la aplicación Next.js como la base de datos PostgreSQL en el mismo servidor:

### 1. Configurar PostgreSQL en el VPS
Instala PostgreSQL en Ubuntu:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```
Inicia sesión en Postgres, crea la base de datos y asigna un usuario:
```bash
sudo -i -u postgres psql
```
```sql
CREATE DATABASE leads_db;
CREATE USER leads_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE leads_db TO leads_user;
\q
```

### 2. Instalar Node.js y PM2
Instala Node.js utilizando NVM (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```
Instala PM2 de manera global para mantener la aplicación Next.js corriendo en segundo plano:
```bash
npm install -g pm2
```

### 3. Preparar el Repositorio y Compilar
Clona el repositorio en tu VPS:
```bash
git clone <url_de_tu_repositorio> leads-backoffice
cd leads-backoffice
npm install --legacy-peer-deps
```
Crea el archivo `.env` en la raíz del proyecto y completa las variables correspondientes con las credenciales de producción:
```env
DATABASE_URL="postgresql://leads_user:tu_password_seguro@localhost:5432/leads_db?schema=public"
NEXTAUTH_URL="https://tu_dominio.com"
NEXTAUTH_SECRET="un_hash_largo_y_aleatorio_32_caracteres"
```
Aplica el esquema a la base de datos remota:
```bash
npx prisma db push
npx prisma db seed # Opcional, si deseas sembrar el admin inicial en producción
```
Compila la aplicación Next.js:
```bash
npm run build
```

### 4. Ejecutar con PM2
Inicia el proceso de producción de Next.js gestionado por PM2:
```bash
pm2 start npm --name "leads-backoffice" -- run start -- -p 3000
```
Configura PM2 para que se ejecute al reiniciar el sistema:
```bash
pm2 startup
pm2 save
```

### 5. Configurar Nginx como Reverse Proxy
Instala Nginx:
```bash
sudo apt install nginx -y
```
Crea un archivo de configuración para tu sitio:
```bash
sudo nano /etc/nginx/sites-available/leads-backoffice
```
Pega la siguiente configuración (reemplazando `tu_dominio.com`):
```nginx
server {
    listen 80;
    server_name tu_dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Habilita el sitio y reinicia Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/leads-backoffice /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Remueve el sitio por defecto si existe
sudo systemctl restart nginx
```

### 6. Instalar SSL con Certbot (Let's Encrypt)
Configura HTTPS seguro de manera automática:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu_dominio.com
```
Sigue los pasos en pantalla. Certbot renovará automáticamente los certificados SSL y configurará la redirección de HTTP a HTTPS.

¡Listo! Tu panel de administración ya estará operativo y protegido con SSL en `https://tu_dominio.com`.
