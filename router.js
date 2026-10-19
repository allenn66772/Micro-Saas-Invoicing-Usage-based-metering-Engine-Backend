const express=require("express")
const { userRegisterController, userLoginController } = require("./Controller/userController")
const jwtMiddleware=require("./Middleware/jwtMiddleware")
const { createApiKeyController, getApiKeyController } = require("./Controller/apiKeyController")

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


module.exports=router



