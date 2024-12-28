import express from "express"
import config from "config"
import userModel from "../../model/Users/Users.js"

const router = express.Router();

router.get("/getallusers",async(req,res)=>{
    try {
        const users = await userModel.find();
        
        if(!users || users.length == 0){
            return res.status(404).json({msg:"No Users Found!"})
        }

        res.status(200).json({msg:"Users Retrieved Successfully!",users})

    } catch (error) {
        console.log("Error Fetching Users:", error);
        res.status(500).json({msg: "An error occurred while fetching users!"})
    }
})

export default router