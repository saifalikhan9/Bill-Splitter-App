import { generateBillPDF } from './pdfGenerator';
import { sendBillEmail, sendBillEmailWithOAuth } from './emailService';
import { billstype } from './types';
import { prisma } from './prisma';


/**
 * Generates a bill PDF and sends it via email
 * @param bill The bill data
 * @param recipientName Name of the recipient
 * @param recipientEmail Email of the recipient
 * @returns Promise resolving to the email send info
 */
export const generateAndSendBillPDF = async (
  bill: billstype,
  recipientName: string,
  recipientEmail: string
) => {
  try {
    // Generate the PDF
    console.log(bill,"bills ");
    console.log(recipientName,"recipientNames ");
    console.log(recipientEmail,"recipientEmails ");
    
    const pdfBuffer = await generateBillPDF(bill, recipientName);
    
    // Format the bill date
    const billDate = new Date(bill.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate total amount for the recipient
    const recipientAmount = bill.details.find(
      detail => detail.name === recipientName
    )?.Amount || 0;
    console.log(recipientAmount,"recipientAmount");
    
    // Try to send with owner's OAuth first, fall back to regular method if it fails
    let emailResult;
    
    try {
      // Send using the owner's OAuth2 credentials
      emailResult = await sendBillEmailWithOAuth(
        bill.ownerId, // The owner's user ID
        recipientEmail,
        recipientName,
        "Monthly Electricity Bill",
        `Bill #${bill.id}, ${billDate}, Amount: $${recipientAmount.toFixed(2)}`,
        pdfBuffer
      );
      
      // If OAuth sending failed, fall back to regular method
      if (!emailResult.success) {
        console.log("OAuth email sending failed, falling back to regular method:", emailResult.message);
        emailResult = await sendBillEmail(
          recipientEmail,
          recipientName,
          "Monthly Electricity Bill",
          `Bill #${bill.id}, ${billDate}, Amount: $${recipientAmount.toFixed(2)}`,
          pdfBuffer
        );
      }
    } catch (error) {
      console.error("Error with OAuth email, falling back to regular method:", error);
      // Fall back to regular email method
      emailResult = await sendBillEmail(
        recipientEmail,
        recipientName,
        "Monthly Electricity Bill",
        `Bill #${bill.id}, ${billDate}, Amount: $${recipientAmount.toFixed(2)}`,
        pdfBuffer
      );
    }
    
    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      throw new Error(`Failed to send email: ${emailResult.message}`);
    }
    
    return {
      success: true,
      emailId: recipientEmail,
      pdfsize: pdfBuffer.BYTES_PER_ELEMENT
    };
  } catch (error) {
    console.error('Error generating and sending bill:', error);
    throw error;
  }
};

/**
 * Processes and sends bills to all flatmates
 * @param bill The bill data
 * @returns Promise resolving to an array of processing results
 */
export const processBillForAllFlatmates = async (bill: billstype) => {
  const results = [];
  
  // Process for each flatmate
  for (const detail of bill.details) {
    try {
      // Get flatmate details
      const { name, userId } = detail;
      const email = await prisma.user.findUnique({
        where:{id : userId},
        select:{
          email:true
        }
      })


      
      if (!email) {
        results.push({
          name,
          success: false,
          error: 'Missing email address'
        });
        continue;
      }
      
      // Generate and send PDF
      const result = await generateAndSendBillPDF(bill, name, email.email );
      
      results.push({
        name,
        success: true,
        emailId: result.emailId
      });
    } catch (error) {
      results.push({
        flatmateName: detail.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}; 