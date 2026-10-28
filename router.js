const express=require("express")
const { userRegisterController, userLoginController, verifyOtpController } = require("./Controller/userController")
const jwtMiddleware=require("./Middleware/jwtMiddleware")
const { createApiKeyController, getApiKeyController, revokeApiKeyController } = require("./Controller/apiKeyController")
const requireApiKey = require("./Middleware/apiKeyMiddleware")
const { recordSingleEventController, recordBatchEventController } = require("./Controller/eventController")
const { getCurrentPeriodUsage } = require("./Controller/usageController")
const { generateInvoiceController, getUserInvoicesController, getSingleInvoiceController, downloadInvoicePDFController } = require("./Controller/invoiceController")

//router
const router=express.Router()
//////////////USer Routes
//User Register
router.post("/register", userRegisterController);
router.post("/verify-code", verifyOtpController);
router.post("/login", userLoginController);


/////////////Api key Route
router.post("/generate-key",jwtMiddleware,createApiKeyController)

//get key
router.get("/get-apiKey",jwtMiddleware,getApiKeyController)
//delete key
router.delete("/revoke-key",jwtMiddleware,revokeApiKeyController)




//////////////////Event routes
router.post("/v1/events",requireApiKey,recordSingleEventController)
// batch events
router.post("/v1/events/batch",requireApiKey,recordBatchEventController)


///////////////////usage route
router.get("/current-period",jwtMiddleware,getCurrentPeriodUsage)


//////////////////invoice route
router.post("/generate-invoice",jwtMiddleware,generateInvoiceController)
router.get("/get-all-invoice",jwtMiddleware,getUserInvoicesController)
router.get("/get-invoice-by/:id",jwtMiddleware,getSingleInvoiceController)
router.get("/invoices/:id/download", jwtMiddleware, downloadInvoicePDFController);


module.exports=router



