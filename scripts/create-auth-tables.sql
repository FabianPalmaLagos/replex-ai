-- ==============================================
-- REPLEX AI - TABLAS DE AUTENTICACIÓN
-- ==============================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Marcar refresh tokens expirados como revocados
    UPDATE refresh_tokens 
    SET is_revoked = true 
    WHERE expires_at < NOW() AND is_revoked = false;
    
    -- Limpiar tokens de verificación de email antiguos (más de 7 días)
    UPDATE users 
    SET email_verification_token = NULL 
    WHERE email_verification_token IS NOT NULL 
    AND created_at < NOW() - INTERVAL '7 days';
    
    -- Limpiar tokens de reset de contraseña expirados
    UPDATE users 
    SET password_reset_token = NULL, password_reset_expires = NULL 
    WHERE password_reset_expires IS NOT NULL 
    AND password_reset_expires < NOW();
    
    -- Eliminar refresh tokens revocados antiguos (más de 30 días)
    DELETE FROM refresh_tokens 
    WHERE is_revoked = true 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON COLUMN users.id IS 'Identificador único del usuario';
COMMENT ON COLUMN users.email IS 'Email único del usuario';
COMMENT ON COLUMN users.password_hash IS 'Hash de la contraseña usando bcrypt';
COMMENT ON COLUMN users.name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.role IS 'Rol del usuario (user, admin)';
COMMENT ON COLUMN users.email_verified IS 'Indica si el email ha sido verificado';
COMMENT ON COLUMN users.email_verification_token IS 'Token para verificación de email';
COMMENT ON COLUMN users.password_reset_token IS 'Token para reset de contraseña';
COMMENT ON COLUMN users.password_reset_expires IS 'Fecha de expiración del token de reset';
COMMENT ON COLUMN users.last_login IS 'Fecha del último login';
COMMENT ON COLUMN users.deleted_at IS 'Fecha de eliminación lógica (soft delete)';

COMMENT ON TABLE refresh_tokens IS 'Tabla de tokens de actualización JWT';
COMMENT ON COLUMN refresh_tokens.user_id IS 'ID del usuario propietario del token';
COMMENT ON COLUMN refresh_tokens.token IS 'Token de actualización único';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Fecha de expiración del token';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Indica si el token ha sido revocado';

-- Insertar usuario administrador por defecto (solo si no existe)
INSERT INTO users (email, password_hash, name, role, email_verified)
SELECT 
    'admin@replex-ai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', -- password: admin123
    'Administrador',
    'admin',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@replex-ai.com'
);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tablas de autenticación creadas exitosamente';
    RAISE NOTICE 'Usuario admin creado: admin@replex-ai.com / admin123';
    RAISE NOTICE 'Ejecuta SELECT cleanup_expired_tokens(); periódicamente para limpiar tokens expirados';
END $$; 