module.exports = {
    api_call: {
        unitName: "Requests",
        model: "graduated", // 'graduated' or 'volume'
        tiers: [
            { upTo: 1000, unitPrice: 0.0 },       // First 1,000 free
            { upTo: 10000, unitPrice: 0.002 },    // Next 9,000 at \$0.002
            { upTo: 50000, unitPrice: 0.0015 },   // Next 40,000 at \$0.0015
            { upTo: Infinity, unitPrice: 0.001 }  // Anything above 50,000 at \$0.001
        ]
    },
    tokens_consumed: {
        unitName: "Tokens",
        model: "graduated",
        tiers: [
            { upTo: 10000, unitPrice: 0.0 },
            { upTo: 500000, unitPrice: 0.00003 },
            { upTo: Infinity, unitPrice: 0.000015 }
        ]
    },
    storage_mb: {
        unitName: "Megabytes",
        model: "volume",
        tiers: [
            { upTo: 100, unitPrice: 0.0 },
            { upTo: 1000, unitPrice: 0.01 },
            { upTo: Infinity, unitPrice: 0.008 }
        ]
    }
};