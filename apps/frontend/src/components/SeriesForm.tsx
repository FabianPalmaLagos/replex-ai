// Componente para crear y editar series
import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { 
  Series, 
  CreateSeriesData, 
  UpdateSeriesData, 
  Platform, 
  ContentStyle, 
  SeriesFrequency,
  platformConfig,
  contentStyleConfig 
} from '../types/series';

interface SeriesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSeriesData | UpdateSeriesData) => void;
  series?: Series; // Para edición
  isLoading?: boolean;
  title?: string;
}

const frequencyOptions: { value: SeriesFrequency; label: string }[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'custom', label: 'Personalizado' },
];

export function SeriesForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  series, 
  isLoading = false,
  title = 'Nueva Serie'
}: SeriesFormProps) {
  const [formData, setFormData] = useState<CreateSeriesData>({
    name: '',
    description: '',
    frequency: 'weekly',
    platforms: [],
    target_audience: '',
    content_style: 'educational',
    auto_publish: false,
    hashtags: [],
  });

  const [hashtagInput, setHashtagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos de la serie para edición
  useEffect(() => {
    if (series) {
      setFormData({
        name: series.name,
        description: series.description || '',
        frequency: series.frequency || 'weekly',
        platforms: series.platforms,
        target_audience: series.target_audience || '',
        content_style: series.content_style || 'educational',
        auto_publish: series.auto_publish,
        hashtags: series.hashtags,
      });
    } else {
      // Reset para nueva serie
      setFormData({
        name: '',
        description: '',
        frequency: 'weekly',
        platforms: [],
        target_audience: '',
        content_style: 'educational',
        auto_publish: false,
        hashtags: [],
      });
    }
    setErrors({});
  }, [series, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Selecciona al menos una plataforma';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handlePlatformToggle = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace('#', '');
    if (tag && !formData.hashtags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag]
      }));
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== tag)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la serie *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Tutoriales de IA"
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe el contenido de tu serie..."
                disabled={isLoading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Plataformas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataformas *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(platformConfig).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePlatformToggle(key as Platform)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.platforms.includes(key as Platform)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <div className="text-sm font-medium">{config.name}</div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.platforms && <p className="mt-1 text-sm text-red-600">{errors.platforms}</p>}
            </div>

            {/* Frecuencia y Estilo de contenido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as SeriesFrequency }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo de contenido
                </label>
                <select
                  value={formData.content_style}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_style: e.target.value as ContentStyle }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {Object.entries(contentStyleConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audiencia objetivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audiencia objetivo
              </label>
              <input
                type="text"
                value={formData.target_audience}
                onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Desarrolladores principiantes, Emprendedores..."
                disabled={isLoading}
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Agregar hashtag..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Auto-publicar */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_publish"
                checked={formData.auto_publish}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_publish: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="auto_publish" className="ml-2 block text-sm text-gray-700">
                Publicar automáticamente los videos generados
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {series ? 'Actualizar' : 'Crear'} Serie
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 