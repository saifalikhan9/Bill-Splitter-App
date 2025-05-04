import PDFDocument from 'pdfkit';
import path from 'path';
import { billstype } from './types';

/**
 * Generates a PDF document for a bill
 * @param bill The bill data
 * @param recipientName Name of the recipient
 * @returns Promise resolving to a buffer containing the PDF
 */
export const generateBillPDF = async (
  bill: billstype,
  recipientName: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 ,font:"public/Roboto.ttf"});
      
      // Build an absolute path to the custom font file
      const fontPath = path.join(process.cwd(), 'public', 'Roboto.ttf');
      
      // Register and set the custom font
      doc.registerFont('Roboto', fontPath);
      doc.font('Roboto'); // now all text will use the Roboto font
      
      // Buffer to store PDF data
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Format the date
      const billDate = new Date(bill.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Add document title
      doc.fontSize(20).text('Flatmate Bill', { align: 'center' });
      doc.moveDown();
      
      // Add bill information
      doc.fontSize(12).text(`Bill ID: ${bill.id}`);
      doc.text(`Date: ${billDate}`);
      doc.text(`Description: This Month's total units used ${bill.masterReading}`);
      doc.text(`Total Amount: $${bill.actualBill.toFixed(2)}`);
      doc.moveDown();
      
      // Add recipient-specific information
      const recipientDetail = bill.details.find(
        detail => detail.name === recipientName
      );
      
      if (recipientDetail) {
        doc.fontSize(14).text(`Your Share: $${recipientDetail.Amount.toFixed(2)}`);
        doc.moveDown();
      }
      
      // Add breakdown table
      doc.fontSize(14).text('Breakdown by Flatmate:', { underline: true });
      doc.moveDown(0.5);
      
      // Table headers
      const tableTop = doc.y;
      const tableLeft = 50;
      doc.fontSize(12);
      
      // Draw table headers
      doc.text('Flatmate', tableLeft, tableTop);
      doc.text('Amount', tableLeft + 200, tableTop);
      doc.text('Status', tableLeft + 300, tableTop);
      
      // Draw header line
      doc.moveTo(tableLeft, tableTop + 20)
         .lineTo(tableLeft + 400, tableTop + 20)
         .stroke();
      
      // Draw rows
      let rowTop = tableTop + 30;
      bill.details.forEach(detail => {
        doc.text(detail.name, tableLeft, rowTop);
        doc.text(`$${detail.Amount.toFixed(2)}`, tableLeft + 200, rowTop);
        rowTop += 20;
      });
      
      if (doc.y > doc.page.height - 100) {
        console.log("Adding new page for footer");
        
        doc.addPage(); // Add new page if too close to bottom
      }

      // Footer
      doc.fontSize(10).text(
        `This bill was generated automatically on ${new Date().toLocaleDateString()}.`,
        50,
        doc.page.height - 100,
        { align: 'center' }
      );
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.log(error, "erroes");
      reject(error);
    }
  });
};
