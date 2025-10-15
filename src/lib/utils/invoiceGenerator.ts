import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceOrder {
  id: string;
  order_number?: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  shipping_address: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const generateInvoicePDF = (order: InvoiceOrder) => {
  const doc = new jsPDF();
  
  // Colores corporativos
  const primaryColor: [number, number, number] = [124, 58, 237]; // glow-600
  const textDark: [number, number, number] = [31, 41, 55]; // gray-800
  const textLight: [number, number, number] = [107, 114, 128]; // gray-500

  // ====== ENCABEZADO ======
  const pageWidth = doc.internal.pageSize.width;
  
  // Logo y nombre de empresa
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GlowHair', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Productos de Belleza Premium', 20, 28);

  // FACTURA - título
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${order.order_number || order.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 28, { align: 'right' });

  // ====== INFORMACIÓN DE LA EMPRESA ======
  let yPos = 55;
  doc.setTextColor(...textDark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('GlowHair S.A.', 20, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textLight);
  doc.text('RUT: 21 234 567 0012', 20, yPos + 5);
  doc.text('Av. Italia 2525, Montevideo', 20, yPos + 10);
  doc.text('Uruguay', 20, yPos + 15);
  doc.text('Tel: +598 2123 4567', 20, yPos + 20);
  doc.text('www.glowhair.com.uy', 20, yPos + 25);

  // ====== INFORMACIÓN DEL CLIENTE ======
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text('Cliente:', pageWidth - 85, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textLight);
  doc.text(`${order.shipping_address.firstName} ${order.shipping_address.lastName}`, pageWidth - 85, yPos + 5);
  doc.text(order.shipping_address.email, pageWidth - 85, yPos + 10);
  doc.text(order.shipping_address.phone, pageWidth - 85, yPos + 15);
  doc.text(order.shipping_address.address, pageWidth - 85, yPos + 20);
  doc.text(`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}`, pageWidth - 85, yPos + 25);
  doc.text(order.shipping_address.country, pageWidth - 85, yPos + 30);

  // ====== INFORMACIÓN DE LA FACTURA ======
  yPos = 95;
  
  // Línea divisoria
  doc.setDrawColor(...textLight);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 8;
  
  // Fecha y detalles
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const fechaEmision = new Date(order.created_at).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Fecha de emisión: ${fechaEmision}`, 20, yPos);
  doc.text(`Método de pago: ${order.payment_method === 'mercadopago' ? 'MercadoPago' : order.payment_method}`, 20, yPos + 5);
  
  // Estado
  const estadoTexto = order.status === 'pending' ? 'Pendiente' :
                       order.status === 'processing' ? 'Procesando' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'delivered' ? 'Entregado' : 'Cancelado';
  doc.text(`Estado: ${estadoTexto}`, 20, yPos + 10);
  
  const pagoTexto = order.payment_status === 'paid' ? 'Pagado' :
                     order.payment_status === 'pending' ? 'Pendiente' : 'Fallido';
  doc.text(`Estado de pago: ${pagoTexto}`, 20, yPos + 15);

  // ====== TABLA DE PRODUCTOS ======
  yPos += 25;
  
  const tableData = order.items.map(item => [
    item.product_name,
    item.quantity.toString(),
    `$ ${item.unit_price.toFixed(2)}`,
    `$ ${item.total_price.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textDark
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  // ====== TOTALES ======
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPos + 40;
  yPos = finalY + 10;

  // Cuadro de totales
  const totalsX = pageWidth - 75;
  
  doc.setFontSize(9);
  doc.setTextColor(...textLight);
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`$ ${order.subtotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
  
  doc.text('Impuestos:', totalsX, yPos + 6);
  doc.text(`$ ${order.tax_amount.toFixed(2)}`, pageWidth - 20, yPos + 6, { align: 'right' });
  
  doc.text('Envío:', totalsX, yPos + 12);
  doc.text(`$ ${order.shipping_amount.toFixed(2)}`, pageWidth - 20, yPos + 12, { align: 'right' });
  
  // Línea antes del total
  doc.setLineWidth(0.5);
  doc.line(totalsX, yPos + 16, pageWidth - 20, yPos + 16);
  
  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text('TOTAL:', totalsX, yPos + 23);
  doc.text(`$ ${order.total.toFixed(2)}`, pageWidth - 20, yPos + 23, { align: 'right' });

  // ====== NOTAS AL PIE ======
  yPos += 35;
  
  // Línea divisoria
  doc.setDrawColor(...textLight);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 8;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textLight);
  doc.text('Gracias por su compra en GlowHair', 20, yPos);
  doc.text('Para cualquier consulta, contáctenos a info@glowhair.com.uy o al +598 2123 4567', 20, yPos + 5);
  
  // Nota legal
  yPos += 15;
  doc.setFontSize(7);
  doc.text('Este documento constituye una factura válida según la normativa uruguaya vigente.', 20, yPos);
  doc.text('Los productos están sujetos a disponibilidad. Garantía según términos y condiciones.', 20, yPos + 4);

  // ====== PIE DE PÁGINA ======
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('GlowHair - Belleza que Brilla', pageWidth / 2, pageHeight - 7, { align: 'center' });

  // Guardar PDF
  const fileName = `Factura_${order.order_number || order.id.slice(0, 8)}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
