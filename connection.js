const mongoose=require("mongoose")
const connectionString=process.env.DATABASE

mongoose.connect(connectionString).then(res=>{
    console.log("expressServer data connection Successfull");
    
}).catch(err=>{
    console.log(`mongoDB connection failed`);
    console.log(err);
    
    
})