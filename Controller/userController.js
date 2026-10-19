const bcrypt=require("bcrypt");
const users = require("../Models/userModel");
const jwt =require("jsonwebtoken")
// const users=require("../Models/userModel")


//register
exports.userRegisterController=async(req,res)=>{
    console.log("Inside UserRegisterController");
    const{userName,email,Password}=req.body
    console.log(userName,email,Password);
    try {
        const existingUser=await users.findOne({email})
        if(existingUser){
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

//login
exports.userLoginController=async(req,res)=>{
    console.log(`Inside user login controller`);
    const {email,Password}=req.body;
    console.log(email,Password);
    
    try {
        const existingUser=await users.findOne({email})
        if(existingUser){
            let isUserLogedIn=existingUser.role="user"?await bcrypt.compare(Password,existingUser.Password):Password==existingUser.Password
            if(isUserLogedIn){
                const token = jwt.sign({email,role:existingUser.role,userId:existingUser._id},process.env.SecretKey)
                res.status(200).json({user:existingUser,token})
            }else{
                res.status(401).json("Invalid email/password")
            }

        }else{
            res.status(404).json("Invalid Email Please register")
        }
        
    } catch (error) {
        res.status(500).json(error)
    }
    
}