const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

module.exports = function generatePDF(order, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const receiptPath = path.join(__dirname, `../receipt-${order._id}.pdf`);
    const stream = fs.createWriteStream(receiptPath);
    doc.pipe(stream);

    doc.fontSize(20).text('🧾 MenuApp Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Customer: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.moveDown();

    order.items.forEach(item => {
      doc.text(`${item.name} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
    });

    doc.moveDown();
    doc.text(`Total = $${order.total.toFixed(2)}`);
    doc.text(`Total = $${order.total.toFixed(2)}`);
    doc.end();

    stream.on('finish', () => resolve(receiptPath));
    stream.on('error', reject);
  });
};
