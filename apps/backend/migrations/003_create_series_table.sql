-- Migration: Create series table
-- Description: Tabla principal para gestión de series de videos
-- Author: Replex AI Backend
-- Date: 2025-06-15

-- Crear tabla series
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- 'active', 'paused', 'draft'
  
  -- Configuración de generación
  frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'custom'
  platforms TEXT[] DEFAULT '{}', -- ['tiktok', 'instagram', 'youtube']
  target_audience VARCHAR(100),
  content_style VARCHAR(100), -- 'educational', 'entertainment', 'promotional'
  voice_settings JSONB DEFAULT '{}',
  
  -- Métricas calculadas
  video_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Configuración avanzada
  auto_publish BOOLEAN DEFAULT false,
  publish_schedule JSONB DEFAULT '{}', -- horarios por plataforma
  hashtags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  last_video_generated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices para performance
CREATE INDEX idx_series_user_id ON series(user_id);
CREATE INDEX idx_series_status ON series(status);
CREATE INDEX idx_series_deleted_at ON series(deleted_at);
CREATE INDEX idx_series_name_search ON series USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_series_updated_at();

-- Crear tabla series_templates (plantillas)
CREATE TABLE series_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'education', 'business', 'entertainment'
  default_settings JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla series_history (auditoría)
CREATE TABLE series_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted'
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para tablas auxiliares
CREATE INDEX idx_series_templates_category ON series_templates(category);
CREATE INDEX idx_series_templates_public ON series_templates(is_public);
CREATE INDEX idx_series_history_series_id ON series_history(series_id);
CREATE INDEX idx_series_history_user_id ON series_history(user_id);
CREATE INDEX idx_series_history_action ON series_history(action);

-- Insertar plantillas por defecto
INSERT INTO series_templates (name, description, category, default_settings, is_public) VALUES
('Serie Educativa Básica', 'Plantilla para contenido educativo general', 'education', 
 '{"frequency": "weekly", "platforms": ["youtube", "tiktok"], "content_style": "educational", "target_audience": "general"}', true),
('Serie de Entretenimiento', 'Plantilla para contenido de entretenimiento', 'entertainment', 
 '{"frequency": "daily", "platforms": ["tiktok", "instagram"], "content_style": "entertainment", "target_audience": "young_adults"}', true),
('Serie Promocional', 'Plantilla para contenido promocional de productos', 'business', 
 '{"frequency": "custom", "platforms": ["instagram", "youtube"], "content_style": "promotional", "target_audience": "customers"}', true);

-- Comentarios en las tablas
COMMENT ON TABLE series IS 'Tabla principal para gestión de series de videos';
COMMENT ON TABLE series_templates IS 'Plantillas predefinidas para crear series';
COMMENT ON TABLE series_history IS 'Historial de cambios en series para auditoría';

COMMENT ON COLUMN series.status IS 'Estado de la serie: active, paused, draft';
COMMENT ON COLUMN series.frequency IS 'Frecuencia de generación: daily, weekly, monthly, custom';
COMMENT ON COLUMN series.platforms IS 'Array de plataformas objetivo: tiktok, instagram, youtube';
COMMENT ON COLUMN series.voice_settings IS 'Configuración JSON para síntesis de voz';
COMMENT ON COLUMN series.publish_schedule IS 'Horarios de publicación por plataforma en JSON';
COMMENT ON COLUMN series.deleted_at IS 'Timestamp para soft delete, NULL si no está eliminado'; 