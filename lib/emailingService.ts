import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  secure: true,
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  auth: {
    user: process.env.OWNER_EMAIL,
    pass: process.env.OWNER_EMAIL_PASSWORD,
  },
});

/**
 * Sends a personalized bill email to a flatmate.
 * @param to - Recipient email address
 * @param name - Flatmate's name
 * @param amount - Bill amount for this flatmate
 * @param reading - Reading for this flatmate
 */
export async function sendBillEmail(
  to: string,
  name: string,
  amount: number,
  reading: number
) {
  const mailOptions = {
    from: `"Bill Splitter App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Monthly Bill Share",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; background-color: #f9f9f9; padding: 24px; border-radius: 10px; color: #333; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
  <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>

  <p style="font-size: 15px; margin-bottom: 10px;">
    Your share for this month’s bill is <strong style="color: #1a73e8;">₹${amount.toFixed(2)}</strong>.
  </p>

  <p style="font-size: 15px; margin-bottom: 10px;">
    Your electricity reading: <strong>${reading.toFixed(2)}</strong>.
  </p>

  <p style="font-size: 15px; margin-bottom: 10px;">
    You can view detailed information by logging into the <strong>Bill Splitter</strong> app.
  </p>

  <p style="font-size: 15px; margin-bottom: 10px;">
    If you have any questions, feel free to reach out.
  </p>

  <p style="font-size: 15px; margin-bottom: 20px;">
    Kindly make your payment at your earliest convenience.
  </p>

  <p style="font-size: 15px;">Thanks,<br/>The <strong>Bill Splitter</strong> Team</p>
</div>

    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { message: "Email sent successfully", messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return error;
  }
}

export async function sendInvitaionEmail(
  to: string,
  name: string,
  link: string
) {
  const mailOptions = {
    from: `"Bill Splitter App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Join Us on Bill Splitter",
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9f9f9; padding: 32px; border-radius: 8px; max-width: 600px; margin: auto; color: #333;">
  <h2 style="color: #1a73e8; margin-bottom: 16px;">You're Invited!</h2>
  <p style="font-size: 16px; margin-bottom: 12px;">Hi ${name},</p>
  <p style="font-size: 15px; margin-bottom: 24px;">
    We'd love for you to join us on <strong>Bill Splitter</strong>! Click the button below to get started:
  </p>
  <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
    Join Now
  </a>
  <p style="font-size: 14px; margin-top: 32px;">Thanks,<br/>The Bill Splitter Team</p>
</div>

    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${to}: ${info.messageId}`);
    return {
      message: "Invitation email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`Failed to send invitation email to ${to}:`, error);
    return { message: "Failed to send invitation email", error: error };
  }
}
