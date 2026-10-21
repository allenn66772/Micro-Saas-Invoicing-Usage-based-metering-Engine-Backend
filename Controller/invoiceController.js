const mongoose = require("mongoose");
const UsageEvent = require("../Models/eventModel")
const Invoice = require("../Models/invoiceModel")

const { calculateMetricCost } = require("../services/billingEngine");

/**
 * Generate Invoice Endpoint
 * POST /api/invoices/generate
 */
exports.generateInvoiceController = async (req, res) => {
    try {
        const customerId = req.userId;

        if (!customerId) {
            return res.status(400).json({ error: "Customer ID missing from token." });
        }

        // Default billing cycle: First day of current month to now (or custom dates via body)
        const now = new Date();
        const cycleStart = req.body.startDate
            ? new Date(req.body.startDate)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const cycleEnd = req.body.endDate ? new Date(req.body.endDate) : now;

        // 1. Run MongoDB Aggregation Pipeline to sum raw events for this customer
        const rawUsage = await UsageEvent.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(customerId),
                    timestamp: { $gte: cycleStart, $lte: cycleEnd },
                },
            },
            {
                $group: {
                    _id: "\$metric",
                    totalQuantity: { $sum: "$quantity" },
                },
            },
        ]);

        // 2. Process each metric through the Tiered Billing Engine
        let totalInvoiceAmount = 0;
        const lineItems = rawUsage.map((usageRow) => {
            const metricName = usageRow._id;
            const quantity = usageRow.totalQuantity;

            // Evaluates tiered/graduated pricing logic
            const calculated = calculateMetricCost(metricName, quantity);
            totalInvoiceAmount += calculated.totalCost;

            return {
                metric: calculated.metric,
                unitName: calculated.unitName,
                totalUnits: calculated.totalUnits,
                subtotal: calculated.totalCost,
                tierBreakdown: calculated.tierBreakdown,
            };
        });

        // 3. Create unique sequential-style invoice number (e.g. INV-202610-4821)
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${randomSuffix}`;

        // 4. Save Invoice record to MongoDB
        const newInvoice = await Invoice.create({
            customerId,
            billingPeriod: {
                start: cycleStart,
                end: cycleEnd,
            },
            lineItems,
            totalAmount: Number(totalInvoiceAmount.toFixed(2)),
            status: "unpaid",
            invoiceNumber,
        });

        return res.status(201).json({
            message: "Invoice generated successfully.",
            invoice: newInvoice,
        });
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        return res.status(500).json({ error: error.message || "Failed to generate invoice." });
    }
};


// Add to controllers/invoiceController.js

// GET /api/invoices (List all invoices for the authenticated user)
exports.getUserInvoicesController = async (req, res) => {
    try {
        const customerId = req.userId;
        const invoices = await Invoice.find({ customerId }).sort({ createdAt: -1 });
        return res.status(200).json({ invoices });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({ error: "Failed to fetch invoices." });
    }
};

// GET /api/invoices/:id (Fetch a single invoice by ID)
exports.getSingleInvoiceController = async (req, res) => {
    try {
        const customerId = req.userId;
        const { id } = req.params;

        const invoice = await Invoice.findOne({ _id: id, customerId });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found." });
        }

        return res.status(200).json({ invoice });
    } catch (error) {
        console.error("Error fetching single invoice:", error);
        return res.status(500).json({ error: "Failed to fetch invoice details." });
    }
};

// PATCH /api/invoices/:id/pay
exports.markInvoicePaidController = async (req, res) => {
    try {
        const customerId = req.userId;
        const { id } = req.params;

        const invoice = await Invoice.findOneAndUpdate(
            { _id: id, customerId },
            { $set: { status: "paid" } },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found." });
        }

        return res.status(200).json({ message: "Invoice marked as paid.", invoice });
    } catch (error) {
        console.error("Error updating invoice status:", error);
        return res.status(500).json({ error: "Failed to update invoice status." });
    }
};