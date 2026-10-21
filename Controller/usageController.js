const mongoose = require("mongoose")
const UsageEvent = require("../Models/eventModel")
const pricingConfig = require("../config/pricingConfig")



/**
 * Aggregates current billing cycle usage for the logged-in user
 * GET /api/usage/current-period
 */
exports.getCurrentPeriodUsage = async (req, res) => {
    try {
        const customerId = req.userId; // Extracted from jwtMiddleware

        if (!customerId) {
            return res.status(400).json({ error: "Customer ID missing from token." });
        }

        // Default billing cycle: First day of current month to now
        const now = new Date();
        const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run MongoDB Aggregation Pipeline
        const rawUsage = await UsageEvent.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(customerId),
                    timestamp: { $gte: cycleStart, $lte: now },
                },
            },
            {
                $group: {
                    _id: "$metric",
                    totalQuantity: { $sum: "$quantity" },
                    eventCount: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        // Apply pricing model to calculate billable units and monetary subtotals
        let estimatedTotalAmount = 0;

        const breakdown = rawUsage.map((item) => {
            const metricKey = item._id;
            const totalUnits = item.totalQuantity;
            const ratePlan = pricingConfig[metricKey] || {
                unitName: "Units",
                freeUnits: 0,
                unitPrice: 0,
            };

            const billableUnits = Math.max(0, totalUnits - ratePlan.freeUnits);
            const subtotal = Number((billableUnits * ratePlan.unitPrice).toFixed(4));
            estimatedTotalAmount += subtotal;

            return {
                metric: metricKey,
                unitName: ratePlan.unitName,
                totalUnits,
                freeUnits: ratePlan.freeUnits,
                billableUnits,
                ratePerUnit: ratePlan.unitPrice,
                subtotal,
                totalEventsLogged: item.eventCount,
            };
        });

        return res.status(200).json({
            billingPeriod: {
                start: cycleStart,
                end: now,
            },
            breakdown,
            estimatedTotalAmount: Number(estimatedTotalAmount.toFixed(2)),
        });
    } catch (error) {
        console.error("Aggregation pipeline failure:", error);
        return res.status(500).json({ error: "Failed to aggregate usage." });
    }
};