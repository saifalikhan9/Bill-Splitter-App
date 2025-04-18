  import nodemailer from 'nodemailer';
  import { prisma } from './prisma';

  interface EmailAttachment {
    filename: string;
    content: Buffer;
  }

  interface EmailSendResult {
    success: boolean;
    message: string;
    error?: any;
  }

  interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
    provider: string;
  }

  /**
   * Stores OAuth2 tokens for a user's email
   * @param userId The user's ID
   * @param tokens The OAuth2 tokens
   */
  export const storeEmailOAuthTokens = async (
    userId: number,
    tokens: OAuthTokens
  ): Promise<void> => {
    console.log("Storing OAuth tokens for user:", userId);
    console.log("Token data:", { 
      provider: tokens.provider,
      accessToken: tokens.accessToken ? `${tokens.accessToken.substring(0, 10)}...` : 'missing',
      refreshToken: tokens.refreshToken ? `${tokens.refreshToken.substring(0, 10)}...` : 'missing',
      expiryDate: tokens.expiryDate ? tokens.expiryDate.toISOString() : 'missing'
    });
    
    try {
      const updateResult = await prisma.user.update({
        where: { id: userId },
        data: {
          emailProvider: tokens.provider,
          emailAccessToken: tokens.accessToken,
          emailRefreshToken: tokens.refreshToken,
          emailTokenExpiry: tokens.expiryDate,
          emailAuthorized: true
        },
        select: {
          id: true,
          email: true,
          emailProvider: true,
          emailAuthorized: true
        }
      });
      
      console.log("OAuth tokens stored successfully:", updateResult);
    } catch (error) {
      console.error("Error storing OAuth tokens:", error);
      throw error;
    }
  };

  /**
   * Checks if a user has authorized email sending via OAuth2
   * @param userId The user's ID
   * @returns Whether the user has authorized email sending
   */
  export const isEmailAuthorized = async (userId: number): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailAuthorized: true }
    });
    
    return user?.emailAuthorized || false;
  };

  /**
   * Sends an email as a specific owner user
   * @param userId The owner's user ID
   * @param to Recipient email address
   * @param subject Email subject
   * @param text Plain text email body
   * @param html HTML email body (optional)
   * @param attachments Array of file attachments (optional)
   * @returns Promise resolving to the email send result
   */
  export const sendEmailAsOwner = async (
    userId: number,
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: EmailAttachment[]
  ): Promise<EmailSendResult> => {
    try {
      // Get owner information with OAuth tokens
      const owner = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailProvider: true,
          emailAccessToken: true,
          emailRefreshToken: true,
          emailTokenExpiry: true,
          emailAuthorized: true
        }
      });

      if (!owner || !owner.emailAuthorized) {
        return {
          success: false,
          message: 'Owner has not authorized email sending',
        };
      }

      // Create transporter using OAuth2
      let transporter;
      
      // Check if using OAuth
      if (owner.emailAccessToken && owner.emailRefreshToken) {
        console.log("reaches at oauth2");
        
        transporter = nodemailer.createTransport({
          service: owner.emailProvider,
          auth: {
            type: 'OAuth2',
            user: owner.email,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: owner.emailRefreshToken,
            accessToken: owner.emailAccessToken,
            expires: owner.emailTokenExpiry ? 
              Math.floor((owner.emailTokenExpiry.getTime() - Date.now()) / 1000) : 
              3600
          }
        });
      } else {
        // Fallback to default method
        const testAccount = await nodemailer.createTestAccount();
        console.log("reaches at default");
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || testAccount.user,
            pass: process.env.SMTP_PASS || testAccount.pass,
          },
        });
      }

      // Setup email data
      const mailOptions = {
        from: `${owner.name} <${owner.email}>`,
        to,
        subject,
        text,
        html: html || text,
        attachments: attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content
        })) || []
      };

      // Send mail
      const info = await transporter.sendMail(mailOptions);

      // For development with Ethereal, log the preview URL
      if (info.messageId && process.env.NODE_ENV !== 'production') {
        console.log('Message sent: %s', info.messageId);
        if (nodemailer.getTestMessageUrl(info)) {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
      }

      return {
        success: true,
        message: `Email sent: ${info.messageId}`,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error
      };
    }
  };

  /**
   * Sends an email with optional attachments
   * @param to Recipient email address
   * @param subject Email subject
   * @param text Plain text email body
   * @param html HTML email body (optional)
   * @param attachments Array of file attachments (optional)
   * @param from Override the sender email (optional)
   * @returns Promise resolving to the email send result
   */
  export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: EmailAttachment[],
    from?: string
  ): Promise<EmailSendResult> => {
    try {
      let transporter;

      // Check if owner email credentials are provided in environment variables
      if (process.env.OWNER_EMAIL && process.env.OWNER_EMAIL_PASSWORD) {
        // Use owner's email credentials with app password (old method)
        transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail', 'outlook', etc.
          auth: {
            user: process.env.OWNER_EMAIL,
            pass: process.env.OWNER_EMAIL_PASSWORD,
          },
        });
      } else {
        // Fallback to SMTP or test account
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || testAccount.user,
            pass: process.env.SMTP_PASS || testAccount.pass,
          },
        });
      }

      // Setup email data with sender either from parameters, env vars, or default
      const mailOptions = {
        from: from || process.env.OWNER_EMAIL || process.env.EMAIL_FROM || 'saifsh0921@gmail.com',
        to,
        subject,
        text,
        html: html || text,
        attachments: attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content
        })) || []
      };

      // Send mail with defined transport object
      const info = await transporter.sendMail(mailOptions);

      // For development with Ethereal, log the preview URL
      if (info.messageId && process.env.NODE_ENV !== 'production') {
        console.log('Message sent: %s', info.messageId);
        if (nodemailer.getTestMessageUrl(info)) {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
      }

      return {
        success: true,
        message: `Email sent: ${info.messageId}`,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error
      };
    }
  };

  /**
   * Creates a nodemailer transporter using OAuth2
   * @param userId The user's ID
   * @returns Promise resolving to a nodemailer transporter
   */
  async function createOAuth2Transporter(userId: number) {
    // Get user OAuth credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailProvider: true,
        emailAccessToken: true,
        emailRefreshToken: true,
        emailTokenExpiry: true,
      },
    });

    if (!user?.emailAccessToken || !user?.emailRefreshToken) {
      throw new Error('User has not authorized email sending via OAuth2');
    }

    // Calculate token expiry in seconds
    const expires = user.emailTokenExpiry 
      ? Math.floor((user.emailTokenExpiry.getTime() - Date.now()) / 1000)
      : 3600;

    // Create transporter with OAuth2
    return nodemailer.createTransport({
      service: user.emailProvider || 'gmail',
      auth: {
        type: 'OAuth2',
        user: user.email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: user.emailRefreshToken,
        accessToken: user.emailAccessToken,
        expires: expires
      }
    });
  }

  /**
   * Sends a bill email with PDF attachment using a user's OAuth2 credentials
   * @param userId The owner's user ID
   * @param to Recipient email address
   * @param recipientName Name of the recipient
   * @param subject Email subject
   * @param billDescription Description of the bill
   * @param pdfBuffer Buffer containing the PDF bill
   * @returns Promise resolving to the email send result
   */
  export const sendBillEmailWithOAuth = async (
    userId: number,
    to: string,
    recipientName: string,
    subject: string,
    billDescription: string,
    pdfBuffer: Buffer
  ): Promise<EmailSendResult> => {
    try {
      // Get user details for sending
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, emailAuthorized: true },
      });

      if (!user || !user.emailAuthorized) {
        return {
          success: false,
          message: 'User has not authorized email sending',
        };
      }

      const text = `
  Hello ${recipientName},

  Your bill has been generated.

  Description: ${billDescription}

  Please find the attached PDF for the detailed breakdown.

  Thank you,
  ${user.name}
  `;

      const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4a5568;">Flatmate Bill</h2>
    <p>Hello ${recipientName},</p>
    <p>Your bill has been generated.</p>
    <p><strong>Description:</strong> ${billDescription}</p>
    <p>Please find the attached PDF for the detailed breakdown.</p>
    <p style="margin-top: 30px;">Thank you,<br>${user.name}</p>
  </div>
  `;

      const attachments = [
        {
          filename: `bill_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer
        }
      ];

      // Create OAuth2 transporter
      const transporter = await createOAuth2Transporter(userId);

      // Send mail
      const mailOptions = {
        from: `${user.name} <${user.email}>`,
        to,
        subject,
        text,
        html,
        attachments
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: `Email sent: ${info.messageId}`,
      };
    } catch (error) {
      console.error('Error sending bill email with OAuth:', error);
      return {
        success: false,
        message: 'Failed to send bill email',
        error
      };
    }
  };

  /**
   * Sends a bill email with PDF attachment
   * @param to Recipient email address
   * @param recipientName Name of the recipient
   * @param subject Email subject
   * @param billDescription Description of the bill
   * @param pdfBuffer Buffer containing the PDF bill
   * @returns Promise resolving to the email send result
   */
  export const sendBillEmail = async (
    to: string,
    recipientName: string,
    subject: string,
    billDescription: string,
    pdfBuffer: Buffer
  ): Promise<EmailSendResult> => {
    const text = `
  Hello ${recipientName},

  Your bill has been generated.

  Description: ${billDescription}

  Please find the attached PDF for the detailed breakdown.

  Thank you,
  Flatmate Bills Team
  `;

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4a5568;">Flatmate Bill</h2>
    <p>Hello ${recipientName},</p>
    <p>Your bill has been generated.</p>
    <p><strong>Description:</strong> ${billDescription}</p>
    <p>Please find the attached PDF for the detailed breakdown.</p>
    <p style="margin-top: 30px;">Thank you,<br>Flatmate Bills Team</p>
  </div>
  `;

    const attachments = [
      {
        filename: `bill_${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBuffer
      }
    ];

    return sendEmail(to, subject, text, html, attachments);
  }; 