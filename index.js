const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./router");
const { initBillingCron } = require("./jobs/billingCron");

require("./connection");

const expressServer = express();

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://micro-saas-invoicing-usage-based-me.vercel.app" // no trailing slash
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

// CORS must come before the routes
expressServer.use(cors(corsOptions));
expressServer.options("*", cors(corsOptions)); // preflight (use "/*splat" on Express 5)
expressServer.use(express.json());

expressServer.get("/", (req, res) => {
    res.status(200).send("<h1>expressServer started running and waiting for client request</h1>");
});

expressServer.use(router);

const PORT = process.env.PORT || 3000;

expressServer.listen(PORT, () => {
    console.log(`expressServer started running at port number ${PORT}`);
    initBillingCron(); // start cron after the server is up
});