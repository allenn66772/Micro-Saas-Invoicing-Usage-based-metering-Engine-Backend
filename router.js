const express=require("express")
const { userRegisterController } = require("./Controller/userController")

//router
const router=express.Router()

//User Register
router.post("/register",userRegisterController)


module.exports=router