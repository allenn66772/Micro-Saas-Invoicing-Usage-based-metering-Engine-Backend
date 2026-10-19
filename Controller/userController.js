const bcrypt=require("bcrypt");
const users = require("../Models/userModel");
// const users=require("../Models/userModel")


//register
exports.userRegisterController=async(req,res)=>{
    console.log("Inside UserRegisterController");
    const{userName,email,Password}=req.body
    console.log(userName,email,Password);
    try {
        const existingUSer=await users.findOne({email})
        if(existingUSer){
            res.status(401).json("user already exists Please login")
        }else{
            const encryptpassword=await bcrypt.hash(Password,10)
            console.log(encryptpassword);

            const newUser= new users({
                userName,
                email,
                Password:encryptpassword,
                profile:""
            })
            await newUser.save(
                res.status(200).json(newUser)
            )
            
        }
    } catch (error) {
        res.status(500).json(error)
    }
    
    

}