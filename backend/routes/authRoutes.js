  require('dotenv').config();

  const express=require('express');
const router = express.Router();
  const mongoose=require('mongoose');
  const bodyParser=require('body-parser');
  const ejs=require('ejs');
  const User=require('../models/userModel');
  const bcrypt=require('bcrypt');
  const path = require("path");
  const jwt = require("jsonwebtoken");
  const cookieParser = require("cookie-parser");
  const expressLayouts = require("express-ejs-layouts");
  const Listing = require("../models/jobModel");
  const methodOverride = require("method-override");
  const {setCurrentUser,requireAuth,isBuilder}=require('../middleware');
  const multer = require("multer");
  const { storage } = require("../lib/cloudinary");
  const upload = multer({ storage });


 

  router.post("/login",async (req,res)=>{
      try{
      const {username,password}=req.body;
      const user=await User.findOne({username:username});

      if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });      }
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
             return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });      }   

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",   
        secure: false      
      });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username
            }
        });
        }catch(err){
          console.log(err);
         return res.status(500).json({
            success: false,
            message: "Server error"
        });
      }
  }); 
  
    router.post("/signup", async (req, res) => {

    try {

        const { username, password, role } = req.body;

        if (!username || !password || !role) {

            return res.status(400).json({
                success: false,
                message: "Missing fields"
            });

        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        return res.status(201).json({
            success: true,
            message: "Signup successful",
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});

    
  router.post("/logout", (req, res) => {
    res.clearCookie("token");
      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });

});

    router.get("/me",(req,res)=>{

        res.json(req.user);

    });

module.exports = router;