const express=require("express")
const { userRegisterController, userLoginController } = require("./Controller/userController")
// const jwtMiddleware=require("./Middleware/jwtMiddleware")

//router
const router=express.Router()

//User Register
router.post("/register",userRegisterController)
//user Login
router.post("/login",userLoginController)


module.exports=router