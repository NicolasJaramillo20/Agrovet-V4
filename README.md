# AgroVet

Aplicación web para gestión veterinaria y comercio agropecuario. El proyecto está separado en `frontend` (React/Vite) y `backend` (API Node/Express), con MongoDB local como base de datos.

## Requisitos

- Node.js 20.19+ o 22.12+ y npm.
- MongoDB Community Server ejecutándose localmente en el puerto `27017`.

## Configuración e inicio

1. Inicia el servicio de MongoDB local. La base `agrovet` se crea automáticamente al guardar el primer documento.
2. En `backend`, crea el archivo de entorno copiando `.env.example` a `.env` (PowerShell: `Copy-Item .env.example .env`). Cambia `JWT_SECRET` por una clave aleatoria de al menos 32 caracteres y `ADMIN_PASSWORD` por una contraseña segura.
3. Desde la raíz del proyecto, instala las dependencias de los dos workspaces e inicia ambos servidores:

   ```powershell
   npm install
   npm run dev
   ```

   La API queda disponible en `http://localhost:5000` y la aplicación en `http://localhost:5173`. Si se configuraron `ADMIN_EMAIL` y `ADMIN_PASSWORD`, el administrador se crea al iniciar la API. Las variables del ejemplo son solo para desarrollo; reemplázalas antes de usar la aplicación.

También puedes iniciar solo un servidor desde la raíz:

   ```powershell
   npm run dev:backend
   npm run dev:frontend
   ```

Vite reenvía las peticiones `/api` al backend local.

Para compilar el frontend: `npm run build`. Para ejecutar el linter: `npm run lint`. En `backend`, `npm start` inicia el servidor sin Nodemon.

## Variables de entorno del backend

| Variable | Uso | Valor local predeterminado |
| --- | --- | --- |
| `PORT` | Puerto de Express | `5000` |
| `MONGODB_URI` | Cadena de conexión Mongoose | `mongodb://localhost:27017/agrovet` |
| `JWT_SECRET` | Firma de tokens de sesión | Configurar una clave propia |
| `CLIENT_ORIGIN` | Origen autorizado por CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Correo para crear el administrador inicial | Configurar uno propio |
| `ADMIN_PASSWORD` | Contraseña inicial del administrador | Configurar una propia |

No se deben publicar `.env` ni las credenciales de administrador. El `.gitignore` del backend excluye el archivo.

## Funcionalidad

- Registro e inicio de sesión con contraseñas hash y JWT; roles `usuario` y `admin`.
- Perfil personal, gestión de mascotas y solicitudes de citas.
- Catálogo, persistencia local del carrito y compra con validación/descuento atómico del stock por producto.
- Panel de administración con métricas, usuarios, inventario y estados de citas.
- Vistas públicas de inicio, Nosotros, productos y contacto, con interfaz adaptable a móvil.

## API principal

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`
- `GET /api/products`; administración: `POST /api/products`, `PUT /api/products/:id`, `PATCH /api/products/:id/stock`, `PATCH /api/products/:id/active`, `DELETE /api/products/:id`
- `GET|POST /api/pets`, `DELETE /api/pets/:id`
- `GET|POST /api/appointments`, administración: `PATCH /api/appointments/:id/status`
- `POST /api/orders`
- Administración: `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH|DELETE /api/admin/users/:id`
- `GET /api/health`

Las rutas de administración exigen un token de administrador. Las rutas privadas exigen un JWT en la cabecera de autorización Bearer.
