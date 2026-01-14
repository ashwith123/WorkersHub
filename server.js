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
const Listing = require("./models/postModel");
const methodOverride = require("method-override");

app.use(methodOverride('_method'));
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

app.get("/",async (req,res)=>{
    const allListings = await Listing.find();
    res.render("./listings/index" ,{title:"Home",listings:allListings});
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

    res.redirect("/");
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

    res.redirect("/");

    }catch(err){
        console.log(err);
        return res.render("./user/signup", { error: "server error" });
    }
});


app.get("/addListing",requireAuth,async (req,res)=>{
    const user = await User.findById(req.userId);
    res.render("./listings/addListing.ejs", { user, error: null });
});

app.post("/addListing",requireAuth,async (req, res) => {
  try {
    const jobData = req.body.job;

    const postedBy = req.userId;

     if (!jobData) {
      return res.status(400).render("./listings/addListing", {
        error: "Job data is missing",
        job: {}
      });
    }

    // 2️⃣ Required fields check
    const requiredFields = [
      "title",
      "description",
      "workType",
      "buildingType",
      "floors",
      "areaSqFt",
      "city",
      "area",
      "workersRequired",
      "skillLevel",
      "wagePerDay",
      "paymentType",
      "startDate",
      "durationDays"
    ];

    for (let field of requiredFields) {
      if (!jobData[field]) {
        return res.status(400).render("./listings/addListing", {
          error: `${field} is required`,
          job: jobData // 👈 send back filled data
        });
      }
    }

    const newJob = await new Listing({
      ...jobData,
      postedBy
    });

    await newJob.save();


    res.redirect("/");

  } catch (error) {
    console.error(error);
    res.status(500).render("./listings/addListing", {
      error: "Server error. Please try again later.",
      job: req.body.job || {}
    });
  }
});

app.get("/listings/:id",requireAuth,async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId)
      .populate("postedBy"); // 👈 REQUIRED for show.ejs

    if (!listing) {
      return res.status(404).render("listings/index", {
        error: "Listing not found",
        listings: []
      });
    }

    res.render("listings/show", {
      listing,
      currUser: req.user
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
});

app.get("/listings/:id/edit", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("postedBy");

    if (!listing) {
      return res.status(404).render("listings/index", {
        error: "Listing not found",
        listings: []
      });
    }

    if (!listing.postedBy._id.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to edit this listing");
    }

    res.render("listings/edit", { listing });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
});

app.put("/listings/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).render("listings/index", {
        error: "Listing not found",
        listings: []
      });
    }

    if (!listing.postedBy.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to update this listing");
    }

    const updatedData = req.body.job;

    Object.assign(listing, updatedData);
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
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