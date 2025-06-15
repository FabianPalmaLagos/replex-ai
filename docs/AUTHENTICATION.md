# 🔐 Sistema de Autenticación JWT - Replex AI

## 📋 Descripción General

El sistema de autenticación de Replex AI implementa un esquema JWT (JSON Web Tokens) completo con access tokens y refresh tokens, incluyendo verificación de email, reset de contraseña y protección contra ataques de fuerza bruta.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Modelos de Datos** (`src/models/`)
   - `User.ts` - Interface del usuario
   - `RefreshToken.ts` - Interface de tokens de actualización

2. **Schemas de Validación** (`src/schemas/`)
   - `authSchemas.ts` - Validaciones con Joi para todos los endpoints

3. **Servicios** (`src/services/`)
   - `authService.ts` - Lógica de negocio de autenticación
   - `emailService.ts` - Envío de emails transaccionales
   - `tokenService.ts` - Gestión de tokens JWT

4. **Utilidades** (`src/utils/`)
   - `crypto.ts` - Funciones de seguridad y hashing
   - `tokenService.ts` - Generación y verificación de tokens

5. **Middleware** (`src/middleware/`)
   - `auth.ts` - Middleware de autenticación y autorización
   - `rateLimiter.ts` - Rate limiting específico para auth
   - `validation.ts` - Validación de entrada con Joi

6. **Rutas** (`src/routes/`)
   - `auth.ts` - Endpoints de autenticación

## 🔑 Endpoints Disponibles

### Registro de Usuario
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123",
  "name": "Nombre Usuario"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Verifica tu email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "role": "user",
      "email_verified": false
    }
  }
}
```

### Inicio de Sesión
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "role": "user",
      "email_verified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "15m"
    }
  }
}
```

### Renovar Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Cerrar Sesión
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Verificar Email
```http
POST /api/v1/auth/verify-email/:token
```

### Solicitar Reset de Contraseña
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

### Restablecer Contraseña
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NuevaPassword123"
}
```

### Información del Usuario
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Estado de Autenticación
```http
GET /api/v1/auth/status
Authorization: Bearer <access_token>
```

## 🛡️ Seguridad Implementada

### Hashing de Contraseñas
- **bcrypt** con 12 salt rounds
- Validación de fortaleza de contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)

### Tokens JWT
- **Access Token**: 15 minutos de duración
- **Refresh Token**: 7 días de duración
- Algoritmo HS256 con secrets seguros

### Rate Limiting
- **Autenticación general**: 5 intentos por 15 minutos
- **Registro**: 3 intentos por hora
- **Reset de contraseña**: 3 intentos por hora

### Validación de Entrada
- Schemas Joi para todos los endpoints
- Sanitización automática de datos
- Validación de formato de email

## 📧 Sistema de Emails

### Configuración SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@replex-ai.com
```

### Templates Disponibles
1. **Verificación de Email** - Token válido por 24 horas
2. **Reset de Contraseña** - Token válido por 1 hora
3. **Bienvenida** - Enviado tras verificación exitosa

## 🗄️ Base de Datos

### Tabla `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Usuario Admin por Defecto
- **Email**: admin@replex-ai.com
- **Contraseña**: admin123
- **Rol**: admin
- **Email verificado**: true

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-access-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@replex-ai.com
```

## 🧪 Testing

### Endpoints de Prueba
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Registro
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@replex-ai.com","password":"admin123"}'
```

### Credenciales de Prueba
- **Admin**: admin@replex-ai.com / admin123

## 🚨 Manejo de Errores

### Códigos de Error Comunes
- **400**: Datos de entrada inválidos
- **401**: No autenticado o token inválido
- **403**: No autorizado (email no verificado, rol insuficiente)
- **404**: Usuario no encontrado
- **409**: Email ya registrado
- **429**: Rate limit excedido
- **500**: Error interno del servidor

### Formato de Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email es requerido"
      }
    ]
  }
}
```

## 🔄 Flujo de Autenticación

### Registro y Verificación
1. Usuario se registra → Email de verificación enviado
2. Usuario hace clic en enlace → Email verificado
3. Usuario puede hacer login → Tokens generados

### Login y Renovación
1. Usuario hace login → Access + Refresh tokens
2. Access token expira → Usar refresh token
3. Refresh token válido → Nuevos tokens generados

### Reset de Contraseña
1. Usuario solicita reset → Email con token enviado
2. Usuario usa token → Nueva contraseña establecida
3. Todos los refresh tokens revocados → Nuevo login requerido

## 📈 Monitoreo y Logs

### Eventos Loggeados
- Registros exitosos y fallidos
- Intentos de login
- Verificaciones de email
- Resets de contraseña
- Tokens renovados/revocados
- Rate limiting activado

### Métricas Disponibles
- Usuarios registrados por día
- Intentos de login fallidos
- Tokens activos
- Emails enviados

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Autenticación con redes sociales (Google, GitHub)
- [ ] Autenticación de dos factores (2FA)
- [ ] Sesiones múltiples por usuario
- [ ] Logs de actividad del usuario
- [ ] Bloqueo automático por intentos fallidos
- [ ] Notificaciones de seguridad

### Optimizaciones
- [ ] Cache de usuarios en Redis
- [ ] Blacklist de tokens en Redis
- [ ] Compresión de tokens JWT
- [ ] Rotación automática de secrets

---

*Documentación del Sistema de Autenticación JWT - Replex AI*
*Última actualización: Junio 2025* 