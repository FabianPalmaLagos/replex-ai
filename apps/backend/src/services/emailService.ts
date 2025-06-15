import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Configuración de email
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@replex-ai.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true para 465, false para otros puertos
      auth: SMTP_USER && SMTP_PASS ? {
        user: SMTP_USER,
        pass: SMTP_PASS
      } : undefined
    });
  }

  /**
   * Verifica la configuración del transporter
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error verificando conexión SMTP:', error);
      return false;
    }
  }

  /**
   * Envía email de verificación de cuenta
   */
  async sendEmailVerification(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: '🚀 Verifica tu cuenta en Replex AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Bienvenido a Replex AI!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hola ${name},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              ¡Gracias por registrarte en Replex AI! Para completar tu registro y comenzar a crear 
              videos increíbles con IA, necesitas verificar tu dirección de email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Verificar mi cuenta
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              <br>
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Este enlace expirará en 24 horas por seguridad.
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #333; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2025 Replex AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de verificación enviado a: ${email}`);
    } catch (error) {
      logger.error(`Error enviando email de verificación a ${email}:`, error);
      throw new Error('Error enviando email de verificación');
    }
  }

  /**
   * Envía email de reset de contraseña
   */
  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: '🔒 Restablece tu contraseña - Replex AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Restablecer Contraseña</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hola ${name},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en Replex AI.
              Si no solicitaste este cambio, puedes ignorar este email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              <br>
              <a href="${resetUrl}" style="color: #ff6b6b;">${resetUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Este enlace expirará en 1 hora por seguridad.</strong>
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Si no solicitaste este cambio, tu cuenta permanece segura y puedes ignorar este email.
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #333; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2025 Replex AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de reset de contraseña enviado a: ${email}`);
    } catch (error) {
      logger.error(`Error enviando email de reset a ${email}:`, error);
      throw new Error('Error enviando email de reset de contraseña');
    }
  }

  /**
   * Envía email de bienvenida después de verificar la cuenta
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const dashboardUrl = `${FRONTEND_URL}/dashboard`;

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: '🎉 ¡Tu cuenta está lista! - Replex AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Cuenta Verificada!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">¡Perfecto, ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a crear videos 
              increíbles con la potencia de la inteligencia artificial.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="background: linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Ir al Dashboard
              </a>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Crear tu primera serie de videos</li>
                <li>Configurar tus preferencias de IA</li>
                <li>Conectar tus redes sociales</li>
                <li>Explorar plantillas predefinidas</li>
              </ul>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #333; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2025 Replex AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de bienvenida enviado a: ${email}`);
    } catch (error) {
      logger.error(`Error enviando email de bienvenida a ${email}:`, error);
      // No lanzar error aquí, es un email opcional
    }
  }
} 