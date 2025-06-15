export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  email_verified?: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
} 