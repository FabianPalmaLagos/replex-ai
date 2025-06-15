import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Configuración de bcrypt
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Error al hashear contraseña');
  }
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error al verificar contraseña');
  }
}

/**
 * Genera un token seguro aleatorio
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Genera un token de verificación de email
 */
export function generateEmailVerificationToken(): string {
  return generateSecureToken(32);
}

/**
 * Genera un token de reset de contraseña
 */
export function generatePasswordResetToken(): string {
  return generateSecureToken(32);
}

/**
 * Calcula la fecha de expiración para tokens
 */
export function getTokenExpiration(hours: number): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

/**
 * Verifica si un token ha expirado
 */
export function isTokenExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
} 