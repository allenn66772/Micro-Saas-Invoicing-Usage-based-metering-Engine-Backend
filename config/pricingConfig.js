// config/pricingConfig.js
module.exports = {
    // Metric names must match what you send in ingestion
    api_call: {
        unitName: "Requests",
        freeUnits: 1000,           // First 1,000 calls free
        unitPrice: 0.002,           // $0.002 per call after free units
    },
    tokens_consumed: {
        unitName: "Tokens",
        freeUnits: 10000,          // First 10,000 tokens free
        unitPrice: 0.00005,        // $0.05 per 1,000 tokens
    },
    storage_mb: {
        unitName: "Megabytes",
        freeUnits: 100,            // First 100 MB free
        unitPrice: 0.01,           // $0.01 per MB after
    },
};