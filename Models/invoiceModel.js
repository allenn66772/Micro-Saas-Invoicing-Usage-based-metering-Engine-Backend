const  mongoose  = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        billingPeriod: {
            start: { type: Date, required: true },
            end: { type: Date, required: true },
        },
        lineItems: [
            {
                metric: { type: String, required: true },
                unitName: { type: String, required: true },
                totalUnits: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                tierBreakdown: [
                    {
                        range: String,
                        unitsBilled: Number,
                        unitPrice: Number,
                        subtotal: Number,
                    },
                ],
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["draft", "unpaid", "paid", "void"],
            default: "unpaid",
            index: true,
        },
        invoiceNumber: {
            type: String,
            unique: true,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);