import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a clean, professional PDF invoice for a given order.
 * @param {Object} order - The order object containing details, items, shipping, etc.
 */
export const generateInvoicePDF = (order) => {
  if (!order) {
    console.error("No order provided to generateInvoicePDF");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Brand Colors
  const primaryColor = [249, 115, 22]; // Orange #f97316
  const secondaryColor = [30, 41, 59]; // Slate #1e293b
  const accentGray = [100, 116, 139]; // Slate gray #64748b
  const lightBg = [248, 250, 252]; // Slate-50 #f8fafc
  const borderColor = [226, 232, 240]; // Slate-200 #e2e8f0

  // 1. Top Decorative Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 6, "F");

  // 2. Header: Logo & Company Information
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...secondaryColor);
  doc.text("GloBus", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...accentGray);
  doc.text("Premium Global E-Commerce Platform", 14, 28);
  doc.text("Web: www.globus.com | Email: support@globus.com", 14, 33);
  doc.text("Hotline: +880 1800-GLOBUS | Dhaka, Bangladesh", 14, 38);

  // 3. Invoice Header Badge (Right Side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text("INVOICE", pageWidth - 14, 22, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  const invoiceNumber = order.orderNumber ? `#${order.orderNumber}` : `#INV-${String(order._id || "").slice(-8).toUpperCase()}`;
  doc.text(`Invoice: ${invoiceNumber}`, pageWidth - 14, 29, { align: "right" });

  const rawDate = order.timestamps?.created || order.createdAt || new Date();
  const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...accentGray);
  doc.text(`Date: ${formattedDate}`, pageWidth - 14, 34, { align: "right" });

  const paymentStatusText = (order.paymentStatus || (order.orderStatus === "delivered" || order.orderStatus === "processing" ? "PAID" : "PENDING")).toUpperCase();
  const isPaid = paymentStatusText === "PAID" || paymentStatusText === "COMPLETED";
  
  // Status pill badge
  const badgeWidth = 24;
  const badgeHeight = 6;
  const badgeX = pageWidth - 14 - badgeWidth;
  const badgeY = 38;
  if (isPaid) {
    doc.setFillColor(220, 252, 231); // Green 100
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // Green 800
    doc.text(paymentStatusText, badgeX + badgeWidth / 2, badgeY + 4.2, { align: "center" });
  } else {
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14); // Amber 800
    doc.text(paymentStatusText, badgeX + badgeWidth / 2, badgeY + 4.2, { align: "center" });
  }

  // Divider Line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(14, 48, pageWidth - 14, 48);

  // 4. Customer Info & Shipping Address
  const customerName = order.shippingInfo?.fullName || order.userInfo?.name || "Valued Customer";
  const customerEmail = order.shippingInfo?.email || order.userInfo?.email || "N/A";
  const customerPhone = order.shippingInfo?.phone || "N/A";
  const address1 = order.shippingInfo?.address || "N/A";
  const address2 = [
    order.shippingInfo?.city,
    order.shippingInfo?.state,
    order.shippingInfo?.zipCode,
  ].filter(Boolean).join(", ");
  const address3 = order.shippingInfo?.country || "Bangladesh";

  // Box 1: Billed To / Customer
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 53, (pageWidth - 34) / 2, 34, 2, 2, "F");
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, 53, (pageWidth - 34) / 2, 34, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("CUSTOMER DETAILS", 18, 59);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(customerName, 18, 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...accentGray);
  doc.text(`Email: ${customerEmail}`, 18, 71);
  doc.text(`Phone: ${customerPhone}`, 18, 76);
  doc.text(`Method: ${order.paymentMethod || "SSL Commerz"}`, 18, 81);

  // Box 2: Shipping Destination
  const box2X = 14 + (pageWidth - 34) / 2 + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(box2X, 53, (pageWidth - 34) / 2, 34, 2, 2, "F");
  doc.setDrawColor(...borderColor);
  doc.roundedRect(box2X, 53, (pageWidth - 34) / 2, 34, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("SHIPPING DESTINATION", box2X + 4, 59);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...secondaryColor);
  doc.text(customerName, box2X + 4, 65);
  doc.setTextColor(...accentGray);
  doc.text(address1, box2X + 4, 71);
  if (address2) doc.text(address2, box2X + 4, 76);
  doc.text(address3, box2X + 4, 81);

  // 5. Items Table
  const items = Array.isArray(order.items) ? order.items : [];
  const tableData = items.map((item, index) => {
    const name = item.name || item.productName || item.title || "Product";
    let variantInfo = "";
    if (item.variant) {
      if (typeof item.variant === "string") {
        variantInfo = item.variant;
      } else {
        const parts = [];
        if (item.variant.color) parts.push(`Color: ${item.variant.color}`);
        if (item.variant.size) parts.push(`Size: ${item.variant.size}`);
        variantInfo = parts.join(" | ");
      }
    }
    const description = variantInfo ? `${name}\n(${variantInfo})` : name;
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const total = price * quantity;

    return [
      String(index + 1),
      description,
      `BDT ${price.toFixed(2)}`,
      String(quantity),
      `BDT ${total.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 94,
    head: [["#", "Item Description", "Unit Price", "Qty", "Total Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
      cellPadding: 3.5,
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 8.5,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 35, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // 6. Summary Block
  const finalY = doc.lastAutoTable.finalY + 6;
  const summaryBoxWidth = 80;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  const totalAmount = Number(order.orderSummary?.totalAmount || order.total || order.amount || 0);
  const subtotal = Number(order.orderSummary?.subtotal || totalAmount);
  const shipping = Number(order.orderSummary?.shipping || 0);
  const tax = Number(order.orderSummary?.tax || 0);
  const discount = Number(order.orderSummary?.discount || 0);

  const summaryData = [
    ["Subtotal:", `BDT ${subtotal.toFixed(2)}`],
    ["Shipping Fee:", shipping > 0 ? `BDT ${shipping.toFixed(2)}` : "FREE"],
    ["Tax / VAT:", tax > 0 ? `BDT ${tax.toFixed(2)}` : "BDT 0.00"],
  ];

  if (discount > 0) {
    summaryData.push(["Discount:", `- BDT ${discount.toFixed(2)}`]);
  }

  let currentY = finalY;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  summaryData.forEach(([label, value]) => {
    doc.setTextColor(...accentGray);
    doc.text(label, summaryBoxX, currentY);
    doc.setTextColor(...secondaryColor);
    doc.text(value, pageWidth - 14, currentY, { align: "right" });
    currentY += 5;
  });

  // Grand Total Highlight
  currentY += 2;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(summaryBoxX - 4, currentY - 4, summaryBoxWidth + 4, 10, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Grand Total:", summaryBoxX, currentY + 2.5);
  doc.text(`BDT ${totalAmount.toFixed(2)}`, pageWidth - 14, currentY + 2.5, { align: "right" });

  // 7. Payment info note on bottom left
  const paymentNoteY = finalY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text("Payment Information", 14, paymentNoteY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...accentGray);
  doc.text(`Gateway: ${order.paymentMethod || "SSL Commerz Gateway"}`, 14, paymentNoteY + 5);
  if (order.transactionId || order.tran_id) {
    doc.text(`Transaction ID: ${order.transactionId || order.tran_id}`, 14, paymentNoteY + 9.5);
  }
  doc.text(`Order Status: ${(order.orderStatus || "Pending").toUpperCase()}`, 14, paymentNoteY + 14);

  // 8. Footer Notes & Terms
  const footerY = pageHeight - 20;

  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text("Thank you for shopping with GloBus!", pageWidth / 2, footerY + 1, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...accentGray);
  doc.text(
    "If you have any questions concerning this invoice, please contact support@globus.com",
    pageWidth / 2,
    footerY + 5.5,
    { align: "center" }
  );
  doc.text(
    "This is a computer-generated invoice and does not require a physical signature.",
    pageWidth / 2,
    footerY + 9.5,
    { align: "center" }
  );

  // Save the PDF
  const cleanOrderNum = (order.orderNumber || String(order._id || "order")).replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `GloBus_Invoice_${cleanOrderNum}.pdf`;
  doc.save(filename);
};
