const mongoose = require("mongoose")

const usageEventSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        metric: {
            type: String,
            required: true,
            trim: true,
            lowercase: true, // Standardize metric keys (e.g., "api_call")
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
        idempotencyKey: {
            type: String,
            sparse: true, // Only enforces uniqueness when present
            index: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
        versionKey: false, // Disables __v for reduced payload size
    }
);

// Compound index for time-range aggregations per customer
usageEventSchema.index({ customerId: 1, timestamp: -1 });

// Ensure idempotencyKey is unique across the collection
usageEventSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports=mongoose.model("usageEvent",usageEventSchema);