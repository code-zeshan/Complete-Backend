import express from "express"
import config from "config"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../../model/Users/Users";

let JWT_SECRET = config.get("JWT_SECRET");
let URL = config.get("SERVER_URL");

const router = express.router();

router.post("/register",async (req,res)=>{
    try {
        const { fullName, email, password, phone} = req.body;
        console.log(fullName, email, password, phone);
        
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.status(400).json({msg:"Email already Exists!"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const emailToken = Math.random().string(36).substring(2)
        const phoneToken = Math.random().string(36).substring(2);

        console.log(emailToken, phoneToken);

        const newUser = {
            fullName,
            email,
            phone,
            password: hashedPassword,
            userVerifyToken:{
                email: emailToken,
                phone: phoneToken
            }
        }

        await userModel.create(newUser);

        await sendMail({
            subject:"Email Verification",
            to: email,
            html : `
            <p>Click the link below to verify your email:</p>
            <a href="${URL}/api/public/emailverify/${emailToken}">Verfiy Email</a>
            <br>
            <p>If the link doesn't work, copy and paste the following URL into your Browser</p>
            <p>${URL}/api/public/emailverify/${emailToken}</p>
            `
        });

        console.log(`${URL}/api/public/emailverify/${emailToken}`);
        console.log(`Please verify your phone number using the link below:\n\n
            ${URL}/api/public/phoneverify/${phoneToken}`);

        res.status(201).json({msg:"User Registered Successfully! Please verify your email and phone!"})

    } catch (error) {
        console.log(error);
        res.status(500).json({msg:error})
    }
})

router.post("/login", async (req,res)=>{
    try {
        const {email,password} = req.body;

        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({msg: "Invalid Credentials!"})
        }

        if(!user.userVerified.email){
            return res.status(400).json({msg:"Please verify email before Logging In"})
        }
        
        if(!user.userVerified.phone){
            return res.status(400).json({msg: "Please verify Phone before Logging In!"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({msg:"Invalid Credentials!"})
        }

        const token = jwt.sign({id:user._id}, JWT_SECRET, {expiresIn: "1h"});
        res.status(200).json({msg: "User LoggedIn Successfully!",token})

    } catch (error) {
        console.log(error);
        res.status(500).json({msg:error})
    }
})

router.get("/emailverify/:token", async(req,res)=>{
    try {
        const {token} = req.params;
        const user = await userModel.findOne({"userVerifyToken.email":token})

        if(!user){
            return res.status(400).json({msg:"Invalid email Verification Token!"})
        }

        user.userVerified.email = true;
        user.userVerifyToken.email = null;
        
        await user.save();

        res.status(200).json({msg: "Email Verified Successfully!"})

    } catch (error) {
        console.log(error);
        res.status(500).json({msg:error})
    }
})

router.get("/phoneverify/:token", async(req,res)=>{
    try {
        const {token} = req.params;
        const user = await userModel.findOne({"userVerifyToken.phone":token})

        if(!user){
            return res.status(400).json({msg:"Invalid phone Verification Token!"})
        }

        user.userVerified.phone = true;
        user.userVerifyToken.phone = null;
        
        await user.save();

        res.status(200).json({msg: "Phone Verified Successfully!"})

    } catch (error) {
        console.log(error);
        res.status(500).json({msg:error})
    }
})

export default router

