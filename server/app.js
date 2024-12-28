import express from "express"
import config from "config"
import publicRouter from "./controllers/public/index.js"
import userRouter from "./controllers/users/index.js"

import "./utils/dbConnect.js"

const PORT = config.get("PORT");

const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    try {
        res.status(200).json({msg: "Server is up and running!"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:error})
    }
});

app.use("/api/public",publicRouter)
app.use("/api/private/user",userRouter)

app.listen(PORT,()=>{
    console.log(`Server is up and Running ${PORT}`);
});
