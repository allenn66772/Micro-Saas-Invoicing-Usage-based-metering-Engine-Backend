const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    },
    profile:{
        type:String
    },
    role:{
        type:String,
        required:true,
        default:"user"

    }
})

const users=mongoose.model("users",userSchema)
module.exports=users