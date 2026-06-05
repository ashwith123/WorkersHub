  require('dotenv').config();

  const express=require('express');
  const router=express();
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


  router.get("/login",(req,res)=>{
      res.render("./user/login",{error:null});
  });

  router.post("/login",async (req,res)=>{
      try{
      const {username,password}=req.body;
      const user=await User.findOne({username:username});

      if(!user){
          return res.render("./user/login", { error: "User not found" });
      }
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
          return res.render("./user/login", { error: "Invalid credentials" });
      }   

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

      res.redirect("/listings");
      }catch(err){
          console.log(err);
          return res.render("./user/login", { error: "server error" });
      }
  });

   router.get("/signup",(req,res)=>{
        res.render("./user/signup",{error:null});
    });
  
    router.post("/signup",async (req,res)=>{
  
        try{
        const {username,password,role}=req.body;
  
        if (!username || !password || !role) {
            
            return res.render("./user/signup", { error: "Missing fields" });
        }
  
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("./user/signup", { error: "User already exists" });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser=new User({
            username:username,
            password:hashedPassword,
            role:role
        })
  
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
  
        res.redirect("/listings");
  
        }catch(err){
            console.log(err);
            return res.render("./user/signup", { error: "server error" });
        }
    });

    
  router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
  });

module.exports = router;