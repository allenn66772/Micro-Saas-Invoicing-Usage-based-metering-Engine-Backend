const cron = require("node-cron");
const mongoose = require("mongoose");
const User = require("../Models/userModel");
const UsageEvent = require("../Models/eventModel");
const Invoice = require("../Models/invoiceModel");
const { calculateMetricCost } = require("../services/billingEngine");


/**
 * Sweeps all users, aggregates their usage for the previous month,
 * and generates finalized invoices.
 */
async function processMonthlyBilling() {
    console.log("[CRON] Starting automated monthly invoice generation job...");

    const now = new Date();
    // Start of previous month (e.g., Sep 1 00:00:00)
    const cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // End of previous month (e.g., Sep 30 23:59:59.999)
    const cycleEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    try {
        const users = await User.find({}, "_id email");

        for (const user of users) {
            // 1. Run aggregation pipeline for this customer over the closed cycle
            const rawUsage = await UsageEvent.aggregate([
                {
                    $match: {
                        customerId: new mongoose.Types.ObjectId(user._id),
                        timestamp: { $gte: cycleStart, $lte: cycleEnd },
                    },
                },
                {
                    $group: {
                        _id: "$metric",
                        totalQuantity: { $sum: "$quantity" },
                    },
                },
            ]);

            // If user had zero usage, skip or generate a zero-total invoice
            if (!rawUsage.length) {
                continue;
            }

            // 2. Calculate tiered costs
            let totalInvoiceAmount = 0;
            const lineItems = rawUsage.map((usageRow) => {
                const calculated = calculateMetricCost(usageRow._id, usageRow.totalQuantity);
                totalInvoiceAmount += calculated.totalCost;

                return {
                    metric: calculated.metric,
                    unitName: calculated.unitName,
                    totalUnits: calculated.totalUnits,
                    subtotal: calculated.totalCost,
                    tierBreakdown: calculated.tierBreakdown,
                };
            });

            // 3. Create invoice number
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `INV-${cycleStart.getFullYear()}${(cycleStart.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${randomSuffix}`;

            // 4. Save to database
            await Invoice.create({
                customerId: user._id,
                billingPeriod: { start: cycleStart, end: cycleEnd },
                lineItems,
                totalAmount: Number(totalInvoiceAmount.toFixed(2)),
                status: "unpaid",
                invoiceNumber,
            });

            console.log(`[CRON] Generated invoice ${invoiceNumber} for user: ${user.email}`);
        }

        console.log("[CRON] Monthly invoice run completed successfully.");
    } catch (error) {
        console.error("[CRON] Error during monthly billing job:", error);
    }
}

// Schedule to run at 00:05 AM on the 1st day of every month: "5 0 1 * *"
// For testing locally right away, you can use "* * * * *" (runs every minute)
function initBillingCron() {
    cron.schedule("5 0 1 * *", () => {
        processMonthlyBilling();
    });
    console.log("Automated billing cron job initialized.");
}

module.exports = { initBillingCron, processMonthlyBilling };