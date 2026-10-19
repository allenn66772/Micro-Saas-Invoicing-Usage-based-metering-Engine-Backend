const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);


require("dotenv").config()//loads .env file contents into process.env by default

// import express 
const express = require("express")

// import cors
const cors=require("cors")

//import router
const router=require("./router")

//require connection
require("./connection")

const expressServer=express()

expressServer.use(express.json())
expressServer.use(router)

const PORT=3000

expressServer.listen(PORT,()=>{
    console.log(`expressServer started running at port number ${PORT}`);
    
})

expressServer.get("/",(req,res)=>{
    res.status(200).json(`<h1>expressServer started running and waiting for client request</h1>`)
})
