const express=require("express")
const { userRegisterController, userLoginController } = require("./Controller/userController")
const jwtMiddleware=require("./Middleware/jwtMiddleware")
const { createApiKeyController, getApiKeyController, revokeApiKeyController } = require("./Controller/apiKeyController")

//router
const router=express.Router()
//////////////USer Routes
//User Register
router.post("/register",userRegisterController)
//user Login
router.post("/login",userLoginController)


/////////////Api key Route
router.post("/generate-key",jwtMiddleware,createApiKeyController)

//get key
router.get("/get-apiKey",jwtMiddleware,getApiKeyController)
//delete key
router.delete("/revoke-key",jwtMiddleware,revokeApiKeyController)


module.exports=router



