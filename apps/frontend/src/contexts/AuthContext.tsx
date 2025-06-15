import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Servicio de autenticación
class AuthService {
  private getStoredTokens() {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (response.status === 401) {
          throw new Error(data.error?.message || 'Email o contraseña incorrectos');
        } else if (response.status === 400) {
          // Error de validación
          if (data.error?.code === 'VALIDATION_ERROR' && data.error?.details) {
            const firstError = data.error.details[0];
            throw new Error(firstError.message || 'Datos de entrada inválidos');
          }
          throw new Error(data.error?.message || 'Datos inválidos');
        } else if (response.status === 429) {
          throw new Error('Demasiados intentos de login. Intenta de nuevo más tarde.');
        } else if (response.status >= 500) {
          throw new Error('Error del servidor. Intenta de nuevo más tarde.');
        } else {
          throw new Error(data.error?.message || 'Error en el login');
        }
      }

      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.user;
    } catch (error) {
      // Si es un error de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      // Re-lanzar el error para que lo maneje el componente
      throw error;
    }
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en el registro');
    }

    this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.user;
  }

  async logout() {
    const { refreshToken } = this.getStoredTokens();
    
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Error en logout del servidor:', error);
      }
    }

    this.clearTokens();
  }

  async getCurrentUser(): Promise<User | null> {
    const { accessToken } = this.getStoredTokens();
    
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar refresh
          await this.refreshTokens();
          return this.getCurrentUser();
        }
        throw new Error('Error obteniendo usuario');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      this.clearTokens();
      return null;
    }
  }

  async refreshTokens() {
    const { refreshToken } = this.getStoredTokens();
    
    if (!refreshToken) {
      throw new Error('No hay refresh token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      this.clearTokens();
      throw new Error(data.error?.message || 'Error refrescando token');
    }

    this.setTokens(data.data.accessToken, data.data.refreshToken);
  }
}

const authService = new AuthService();

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar estado local incluso si hay error en el servidor
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await authService.register(name, email, password);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      await authService.refreshTokens();
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refrescando token:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 