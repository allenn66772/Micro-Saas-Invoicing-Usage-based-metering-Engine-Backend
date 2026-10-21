const tieredPricingConfig = require("../config/tieredPricingConfig")


function calculateGraduatedCost(units, tiers) {
    let remainingUnits = units;
    let previousLimit = 0;
    let totalCost = 0;
    const tierBreakdown = [];

    for (const tier of tiers) {
        if (remainingUnits <= 0) break;

        const tierCapacity = tier.upTo === Infinity ? Infinity : tier.upTo - previousLimit;
        const unitsInTier = Math.min(remainingUnits, tierCapacity);
        const tierCost = unitsInTier * tier.unitPrice;

        totalCost += tierCost;
        tierBreakdown.push({
            range: `${previousLimit + 1} - ${tier.upTo === Infinity ? "Unlimited" : tier.upTo}`,
            unitsBilled: unitsInTier,
            unitPrice: tier.unitPrice,
            subtotal: Number(tierCost.toFixed(4))
        });

        remainingUnits -= unitsInTier;
        previousLimit = tier.upTo;
    }

    return { totalCost, tierBreakdown };
}

/**
 * Calculates charges where total usage determines the tier applied to all units.
 */
function calculateVolumeCost(units, tiers) {
    const matchedTier = tiers.find((tier) => units <= tier.upTo) || tiers[tiers.length - 1];
    const totalCost = units * matchedTier.unitPrice;

    return {
        totalCost,
        tierBreakdown: [
            {
                range: `All units evaluated at bracket up to ${matchedTier.upTo}`,
                unitsBilled: units,
                unitPrice: matchedTier.unitPrice,
                subtotal: Number(totalCost.toFixed(4))
            }
        ]
    };
}

/**
 * Main engine function to evaluate consumption across all metrics.
 */
function calculateMetricCost(metric, quantity) {
    const plan = tieredPricingConfig[metric];

    if (!plan) {
        return {
            metric,
            unitName: "Units",
            totalUnits: quantity,
            totalCost: 0,
            tierBreakdown: []
        };
    }

    const { totalCost, tierBreakdown } =
        plan.model === "graduated"
            ? calculateGraduatedCost(quantity, plan.tiers)
            : calculateVolumeCost(quantity, plan.tiers);

    return {
        metric,
        unitName: plan.unitName,
        totalUnits: quantity,
        totalCost: Number(totalCost.toFixed(4)),
        tierBreakdown
    };
}

module.exports = { calculateMetricCost };