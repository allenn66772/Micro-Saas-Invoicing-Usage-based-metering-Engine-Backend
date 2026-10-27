const PDFDocumnent = require("pdfkit");

/**
 * Builds a streamable PDF invoice
 * @param {Object} invoice - The invoice document from MongoDB
 * @param {Object} user - The customer user document (email, username, etc.)
 * @param {Object} dataCallback - Callback to emit data chunks
 * @param {Object} endCallback - Callback when stream finishes
 */
function buildInvoicePDF(invoice, user, dataCallback, endCallback) {
    const doc = new PDFDocumnent({ margin: 50 });

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    // --- Header ---
    doc
        .fillColor("#111827")
        .fontSize(22)
        .text("INVOICE", { align: "right" })
        .fontSize(10)
        .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: "right" })
        .text(`Status: ${invoice.status.toUpperCase()}`, { align: "right" })
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: "right" })
        .moveDown();

    // --- Company & Customer Details ---
    doc
        .fontSize(14)
        .text("Metering SaaS Engine Inc.", 50, 50)
        .fontSize(9)
        .fillColor("#6B7280")
        .text("Usage-Based Billing Platform")
        .text("support@meteringsaas.internal")
        .moveDown();

    doc
        .fillColor("#111827")
        .fontSize(10)
        .text("Billed To:", 50, 120)
        .fillColor("#374151")
        .text(`Email: ${user.email || "Customer"}`)
        .text(`Customer ID: ${invoice.customerId}`)
        .text(
            `Period: ${new Date(invoice.billingPeriod.start).toLocaleDateString()} to ${new Date(
                invoice.billingPeriod.end
            ).toLocaleDateString()}`
        )
        .moveDown(2);

    // --- Table Header ---
    const tableTop = 200;
    doc
        .fillColor("#111827")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Metric / Description", 50, tableTop)
        .text("Units Used", 240, tableTop, { width: 90, align: "right" })
        .text("Tiers / Slabs", 350, tableTop, { width: 100, align: "center" })
        .text("Subtotal ($)", 460, tableTop, { width: 90, align: "right" });

    doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .strokeColor("#E5E7EB")
        .stroke();

    // --- Table Rows ---
    let yPosition = tableTop + 25;
    doc.font("Helvetica").fontSize(9).fillColor("#374151");

    invoice.lineItems.forEach((item) => {
        // Generate brief tier description
        const tierSummary = item.tierBreakdown && item.tierBreakdown.length > 0
            ? `${item.tierBreakdown.length} Tier(s) Applied`
            : "Standard Rate";

        doc
            .text(`${item.metric} (${item.unitName})`, 50, yPosition)
            .text(item.totalUnits.toLocaleString(), 240, yPosition, { width: 90, align: "right" })
            .text(tierSummary, 350, yPosition, { width: 100, align: "center" })
            .text(`$${item.subtotal.toFixed(2)}`, 460, yPosition, { width: 90, align: "right" });

        yPosition += 25;
    });

    // --- Divider ---
    doc
        .moveTo(50, yPosition + 10)
        .lineTo(550, yPosition + 10)
        .strokeColor("#E5E7EB")
        .stroke();

    // --- Total Amount ---
    const totalTop = yPosition + 25;
    doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text("Total Due:", 350, totalTop, { width: 100, align: "right" })
        .text(`$${invoice.totalAmount.toFixed(2)}`, 460, totalTop, { width: 90, align: "right" });

    // --- Footer ---
    doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#9CA3AF")
        .text("Thank you for your business. For any billing questions, contact support.", 50, 700, {
            align: "center",
            width: 500,
        });

    doc.end();
}

module.exports = { buildInvoicePDF };