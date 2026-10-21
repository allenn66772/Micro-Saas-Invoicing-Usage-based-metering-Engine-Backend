const UsageEvent = require("../Models/eventModel")

//single event ingestion POST
exports.recordSingleEventController = async (req, res) => {
    console.log("Inside record Single Event Controller");

    const { metric, quantity, idempotencyKey, timestamp } = req.body;

    if (!metric) {
        res.status(400).json({ error: "Missing field : Metric" })
    }

    try {
        const event = await UsageEvent.create({
            customerId: req.customer._id,
            metric,
            quantity: typeof quantity == "number" && quantity > 0 ? quantity : 1,
            idempotencyKey: idempotencyKey || undefined,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        });
        return res.status(202).json({
            status: "accepted",
            eventId: event._id,
            recordedAt: event.timestamp,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({
                status: "duplicate ignored",
                message: "Event already recorded with idempotency key"
            });
        }
        console.error("Event ingestion failed", error)
        return res.status(500).json({ error: "Failed to record event " });
    }
}

//batch event ingestion


exports.recordBatchEventController = async (req, res) => {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: "Field 'events' must be a non-empty array." });
    }
    if (events.length > 500) {
        return res.status(413).json({ error: "Batch payload exceeds maximum size of 500 events." });
    }

    const customerId = req.customer._id;
    const docsToInsert = [];
    const rejected = [];

    events.forEach((item, index) => {
        if (!item || typeof item.metric !== "string" || !item.metric.trim()) {
            return rejected.push({ index, error: "metric must be a non-empty string." });
        }
        if (
            item.quantity !== undefined &&
            (typeof item.quantity !== "number" || !Number.isFinite(item.quantity) || item.quantity <= 0)
        ) {
            return rejected.push({ index, error: "quantity must be a positive number." });
        }
        const timestamp = item.timestamp ? new Date(item.timestamp) : new Date();
        if (isNaN(timestamp.getTime())) {
            return rejected.push({ index, error: "timestamp is invalid." });
        }

        docsToInsert.push({
            customerId,
            metric: item.metric.toLowerCase().trim(),
            quantity: item.quantity ?? 1,
            idempotencyKey: item.idempotencyKey || undefined,
            timestamp,
        });
    });

    if (docsToInsert.length === 0) {
        return res.status(400).json({ error: "No valid events in batch.", rejected });
    }

    try {
        const result = await UsageEvent.insertMany(docsToInsert, { ordered: false });

        return res.status(rejected.length ? 207 : 201).json({
            status: rejected.length ? "partially_accepted" : "accepted",
            insertedCount: result.length,
            rejected,
        });
    } catch (error) {
        if (error.writeErrors) {
            const duplicates = error.writeErrors.filter((e) => e.code === 11000).length;
            const failed = error.writeErrors.length - duplicates;
            if (failed > 0) console.error("Non-duplicate write errors:", error.writeErrors);

            return res.status(207).json({
                status: "partially_accepted",
                insertedCount: docsToInsert.length - error.writeErrors.length,
                skippedDuplicates: duplicates,
                failedCount: failed,
                rejected,
            });
        }

        console.error("Batch ingestion error:", error);
        return res.status(500).json({ error: "Failed to process batch events." });
    }
};