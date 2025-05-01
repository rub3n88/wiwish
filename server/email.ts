import nodemailer from 'nodemailer';
import { Gift } from '@shared/schema';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

// Email sender setup
const transporter = nodemailer.createTransport(emailConfig);

// Get the base URL for links
function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.APP_URL || 'https://babyregistry.com';
  }
  return 'http://localhost:5000';
}

// Send a reservation confirmation email
export async function sendReservationEmail(
  to: string,
  name: string,
  gift: Gift,
  registryBabyName: string,
  cancellationToken: string,
): Promise<void> {
  const baseUrl = getBaseUrl();
  const cancellationUrl = `${baseUrl}/cancel-reservation/${cancellationToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #339CFF; font-size: 24px; margin-bottom: 10px;">¡Gracias por tu reserva!</h1>
        <p style="color: #666; font-size: 16px;">Has reservado un regalo para ${registryBabyName}</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="${gift.imageUrl}" alt="${gift.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />
          <div>
            <h2 style="color: #333; font-size: 18px; margin: 0 0 5px 0;">${gift.name}</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Precio: ${gift.price.toFixed(2)} €</p>
            <p style="color: #666; font-size: 14px; margin: 0;">Tienda: ${gift.store}</p>
            ${gift.url ? `<p style="margin-top: 8px;"><a href="${gift.url}" style="color: #339CFF; text-decoration: none;">Ver en tienda</a></p>` : ''}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: #333; font-size: 16px;">Detalles de tu reserva:</p>
        <ul style="color: #666; padding-left: 20px;">
          <li>Nombre: ${name}</li>
          <li>Email: ${to}</li>
          <li>Fecha de reserva: ${new Date().toLocaleDateString()}</li>
        </ul>
      </div>

      <div style="background-color: #fff8e1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">
          <strong>¿Has cambiado de opinión?</strong> No hay problema, puedes cancelar tu reserva haciendo clic en el siguiente botón:
        </p>
        <div style="text-align: center;">
          <a href="${cancellationUrl}" style="background-color: #FF3387; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">Cancelar reserva</a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #999; font-size: 12px;">
          Este correo electrónico ha sido enviado automáticamente. Por favor, no respondas a este mensaje.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Lista de Regalos" <${emailConfig.auth.user}>`,
    to,
    subject: `Confirmación de reserva: ${gift.name} para ${registryBabyName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reservation confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending reservation email:', error);
    throw new Error('Failed to send reservation confirmation email');
  }
}

// Send a cancellation confirmation email
export async function sendCancellationEmail(
  to: string,
  gift: Gift,
  registryBabyName: string,
): Promise<void> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #339CFF; font-size: 24px; margin-bottom: 10px;">Reserva cancelada</h1>
        <p style="color: #666; font-size: 16px;">Tu reserva para el regalo de ${registryBabyName} ha sido cancelada</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="${gift.imageUrl}" alt="${gift.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />
          <div>
            <h2 style="color: #333; font-size: 18px; margin: 0 0 5px 0;">${gift.name}</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Precio: ${gift.price.toFixed(2)} €</p>
            <p style="color: #666; font-size: 14px; margin: 0;">Tienda: ${gift.store}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: #333; font-size: 16px;">
          Has cancelado correctamente la reserva de este regalo. El regalo ahora está disponible para que alguien más lo reserve.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #999; font-size: 12px;">
          Este correo electrónico ha sido enviado automáticamente. Por favor, no respondas a este mensaje.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Lista de Regalos" <${emailConfig.auth.user}>`,
    to,
    subject: `Reserva cancelada: ${gift.name} para ${registryBabyName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw new Error('Failed to send cancellation confirmation email');
  }
}
