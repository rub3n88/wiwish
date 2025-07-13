import { Resend } from "resend";
import { Gift } from "../shared/schema.js";

// Resend configuration
const resendApiKey = process.env.RESEND_API_KEY || "";
const fromEmail = process.env.FROM_EMAIL || "contacto@rubenleon.es";

// Log email configuration
console.log("📧 Resend Email Configuration:");
console.log(`  - API Key: ${resendApiKey ? "✅ SET" : "❌ NOT SET"}`);
console.log(`  - From Email: ${fromEmail}`);
console.log(`  - Environment: ${process.env.NODE_ENV || "development"}`);

// Verify required environment variables
const requiredEnvVars = ["RESEND_API_KEY"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Missing Resend environment variables: ${missingVars.join(", ")}`
  );
} else {
  console.log("✅ All Resend environment variables are set");
}

// Initialize Resend
const resend = new Resend(resendApiKey);

// Test the API key on startup
if (resendApiKey) {
  console.log("🔍 Testing Resend API key...");
  // Note: Resend doesn't have a direct verify method, but we'll test it on first send
} else {
  console.error("❌ Resend API key not provided - emails will fail");
}

// Get the base URL for links
function getBaseUrl(): string {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.APP_URL || "https://babyregistry.com"
      : "http://localhost:3000";

  console.log(`🔗 Base URL for emails: ${baseUrl}`);
  return baseUrl;
}

// Convert relative image URLs to absolute URLs for emails
function getAbsoluteImageUrl(imageUrl: string): string {
  const baseUrl = getBaseUrl();

  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    console.log(`🖼️  Image URL is already absolute: ${imageUrl}`);
    return imageUrl;
  }

  // If it's a relative URL, make it absolute
  const absoluteUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  console.log(`🖼️  Converting relative URL: ${imageUrl} → ${absoluteUrl}`);
  return absoluteUrl;
}

// Send a reservation confirmation email
export async function sendReservationEmail(
  to: string,
  name: string,
  gift: Gift,
  registryBabyName: string,
  cancellationToken: string
): Promise<void> {
  console.log(`📤 Attempting to send reservation email with Resend:`);
  console.log(`  - To: ${to}`);
  console.log(`  - Name: ${name}`);
  console.log(`  - Gift: ${gift.name}`);
  console.log(`  - Registry: ${registryBabyName}`);
  console.log(`  - Token: ${cancellationToken ? "✅ Present" : "❌ Missing"}`);

  const baseUrl = getBaseUrl();
  const cancellationUrl = `${baseUrl}/cancel-reservation/${cancellationToken}`;
  const absoluteImageUrl = getAbsoluteImageUrl(gift.imageUrl);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #339CFF; font-size: 24px; margin-bottom: 10px;">¡Gracias por tu reserva!</h1>
        <p style="color: #666; font-size: 16px;">Has reservado un regalo para ${registryBabyName}</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="${absoluteImageUrl}" alt="${
            gift.name
          }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />
          <div>
            <h2 style="color: #333; font-size: 18px; margin: 0 0 5px 0;">${
              gift.name
            }</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Precio: ${gift.price.toFixed(
              2
            )} €</p>
            <p style="color: #666; font-size: 14px; margin: 0;">Tienda: ${
              gift.store
            }</p>
            ${
              gift.url
                ? `<p style="margin-top: 8px;"><a href="${gift.url}" style="color: #339CFF; text-decoration: none;">Ver en tienda</a></p>`
                : ""
            }
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

  const emailData = {
    from: `Lista de Regalos <${fromEmail}>`,
    to: [to],
    subject: `Confirmación de reserva: ${gift.name} para ${registryBabyName}`,
    html: htmlContent,
  };

  console.log(`📧 Resend email data prepared:`);
  console.log(`  - From: ${emailData.from}`);
  console.log(`  - To: ${emailData.to.join(", ")}`);
  console.log(`  - Subject: ${emailData.subject}`);

  try {
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("❌ Resend API error:", error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log(`✅ Reservation confirmation email sent successfully:`);
    console.log(`  - Email ID: ${data?.id}`);
    console.log(`  - Response data:`, data);
  } catch (error: any) {
    console.error("❌ Error sending reservation email:");
    console.error(`  - Error message: ${error.message}`);
    console.error(`  - Full error:`, error);
    throw new Error("Failed to send reservation confirmation email");
  }
}

// Send a cancellation confirmation email
export async function sendCancellationEmail(
  to: string,
  gift: Gift,
  registryBabyName: string
): Promise<void> {
  console.log(`📤 Attempting to send cancellation email with Resend:`);
  console.log(`  - To: ${to}`);
  console.log(`  - Gift: ${gift.name}`);
  console.log(`  - Registry: ${registryBabyName}`);

  const absoluteImageUrl = getAbsoluteImageUrl(gift.imageUrl);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #339CFF; font-size: 24px; margin-bottom: 10px;">Reserva cancelada</h1>
        <p style="color: #666; font-size: 16px;">Tu reserva para el regalo de ${registryBabyName} ha sido cancelada</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="${absoluteImageUrl}" alt="${
            gift.name
          }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />
          <div>
            <h2 style="color: #333; font-size: 18px; margin: 0 0 5px 0;">${
              gift.name
            }</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Precio: ${gift.price.toFixed(
              2
            )} €</p>
            <p style="color: #666; font-size: 14px; margin: 0;">Tienda: ${
              gift.store
            }</p>
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

  const emailData = {
    from: `Lista de Regalos <${fromEmail}>`,
    to: [to],
    subject: `Reserva cancelada: ${gift.name} para ${registryBabyName}`,
    html: htmlContent,
  };

  console.log(`📧 Resend email data prepared:`);
  console.log(`  - From: ${emailData.from}`);
  console.log(`  - To: ${emailData.to.join(", ")}`);
  console.log(`  - Subject: ${emailData.subject}`);

  try {
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("❌ Resend API error:", error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log(`✅ Cancellation confirmation email sent successfully:`);
    console.log(`  - Email ID: ${data?.id}`);
    console.log(`  - Response data:`, data);
  } catch (error: any) {
    console.error("❌ Error sending cancellation email:");
    console.error(`  - Error message: ${error.message}`);
    console.error(`  - Full error:`, error);
    throw new Error("Failed to send cancellation confirmation email");
  }
}
