-- Script de inicialización de base de datos para Replex AI
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Configurar timezone
SET timezone = 'UTC';

-- Crear función para timestamps automáticos
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos Replex AI inicializada correctamente';
    RAISE NOTICE 'Extensiones creadas: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Esquemas creados: auth, content, analytics';
END $$; 