const { hashApikey } = require("../utils/apiKeysUtils");

const User=requiure("../Models/userModel.js")


const requireApiKey=async(req,res,next)=>{
    console.log("inside api Key middleware");

    const rawKey=req.header('x-api-key')||req.header('Authorization')?.replace('Bearer ','');

    if(!rawKey){
        res.status(401).json({error:"Missing Api Key"})
    }

    try {
        const keyHash=hashApikey(rawKey)
        const user=await User.findOne({'apiKey.keyHash':keyHash}).select('+apiKey.keyHash');

        if(!user){
            res.status(401).json({error:"Unauthorized:Invalid api key"})
        }

        req.customer=user;
        next()
    } catch (error) {
        res.status(500).json({error:"Internal server authentication error"})
    }
    
}

module.exports=requireApiKey