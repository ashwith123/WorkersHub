require('dotenv').config();


const express=require('express');
const app=express();
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const User=require('./models/userModel');
const bcrypt=require('bcrypt');
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const requireAuth = require("./middleware");
const expressLayouts = require("express-ejs-layouts");



app.use(expressLayouts);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set("layout", "layout/boilerplate");
app.set("views", path.join(__dirname, "views"));
app.use((req, res, next) => {
  res.locals.user = null;
  res.locals.success = null;
  res.locals.error = null;
  next();
});

app.get("/",(req,res)=>{

    res.render("./layout/boilerplate");
});

app.get("/login",(req,res)=>{
    res.render("./user/login",{error:null});
});

app.post("/login",async (req,res)=>{
    try{
    const {username,password}=req.body;
    const user=await User.findOne({username:username});

    if(!user){
         return res.render("./user/login", { error: "user already exists" });
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

app.get("/signup",(req,res)=>{
    res.render("./user/signup",{error:null});
});

app.post("/signup",async (req,res)=>{

    try{
    const {username,password}=req.body;

     if (!username || !password) {
        
        return res.render("./user/signup", { error: "Missing fields" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.render("./user/signup", { error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser=new User({
        username:username,
        password:hashedPassword
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

app.get("/listings",requireAuth,async (req,res)=>{
  const user = await User.findById(req.userId);
    res.render("./listings/index.ejs", { user });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("./user/login");
});


mongoose.connect("mongodb://127.0.0.1:27017/workerhub")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})