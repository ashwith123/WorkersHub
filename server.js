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
const expressLayouts = require("express-ejs-layouts");
const Listing = require("./models/jobModel");
const methodOverride = require("method-override");
const {setCurrentUser,requireAuth,isBuilder}=require('./middleware');
const multer = require("multer");
const { storage } = require("./lib/cloudinary");
const upload = multer({ storage });

app.use(methodOverride('_method'));
app.use(expressLayouts);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set("layout", "layout/boilerplate");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(setCurrentUser);
app.use((req, res, next) => {
  res.locals.user = req.user || null;       
  res.locals.success = null;
  res.locals.error = null;
  next();
});

app.get("/",requireAuth,async (req,res)=>{
    const allListings = await Listing.find();
    res.render("./listings/index" ,{listings:allListings});
});

app.get("/login",(req,res)=>{
    res.render("./user/login",{error:null});
});

app.post("/login",async (req,res)=>{
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

    res.redirect("/");

    }catch(err){
        console.log(err);
        return res.render("./user/signup", { error: "server error" });
    }
});

app.get("/addListing",requireAuth,isBuilder,async (req,res)=>{
    const user = await User.findById(req.userId);
    res.render("./listings/addListing.ejs", { user, error: null });
});

app.post("/addListing",requireAuth,isBuilder,upload.single("job[image]"),async (req, res) => {
  try {
    const jobData = req.body.job;
   

     if (req.file) {
        jobData.image = {
          url: req.file.path,
          filename: req.file.filename,
        };
      } else {
        console.log("no image is uploaded");
         delete jobData.image;
      }


     if (!jobData) {
      return res.status(400).render("./listings/addListing", {
        error: "Job data is missing",
        job: {}
      });
    }

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
          job: jobData 
        });
      }
    }

    const postedBy = req.userId;

    const newJob = await new Listing({
      ...jobData,
      postedBy
    });

    await newJob.save();


    res.redirect("/");

  } catch (error) {
    console.log(error);
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
      .populate("postedBy"); 

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

app.delete("/listings/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).render("listings/index", {
        error: "Listing not found",
        listings: []
      });
    }

    console.log("Listing found:", listing);

    if (!listing.postedBy.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to delete this listing");
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
});

app.post("/listings/:id/apply", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).render("listings/index", {
        error: "Listing not found",
        listings: []
      });
    }

    const existingApplication = listing.applications.find(app => app.applicant.equals(req.user._id));
    if (existingApplication) {
      return res.status(400).render("listings/show", {
        error: "You have already applied to this listing",
        listing,
        currUser: req.user
      });
    }

    listing.applications.push({
      applicant: req.user._id,
      status: "Applied"
    });

    console.log("all applications:", listing.applications);

    await listing.save();

    res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
});

app.get("/profile", requireAuth, async (req, res) => {
  const user = req.user;
  let jobs = [];

  if (user.role === "BUILDER") {
    jobs = await Listing.find({ postedBy: user._id });
  } 
  else if (user.role === "WORKER") {
    jobs = await Listing.find({ "applications.applicant": user._id }).populate("applications.applicant");

  }

  res.render("./listings/profile", { user, jobs });
});

app.get("/listings/:id/applicants", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("applications.applicant");

      
    if (!listing) {
      return res.status(404).render("error", {
        message: "Listing not found"
      });
    }

    res.render("./listings/applicants", { job: listing });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong"
    });
  }
});


app.post(
  "/listings/:jobId/applicants/:workerId/accept",
  requireAuth,
  isBuilder,
  async (req, res) => {

    const { jobId, workerId } = req.params;

    const job = await Listing.findById(jobId);

    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).end();
    }

    const acceptedCount = job.applications.filter(
      a => a.status === "Accepted"
    ).length;

    if (acceptedCount >= job.workersRequired) {
      res.locals.error = "Worker limit reached";
      return res.redirect(`/listings/${jobId}/applicants`);
    }

    const application = job.applications.find(
      a => a.applicant.toString() === workerId
    );

    if (!application) {
      return res.status(404).end();
    }

    application.status = "Accepted";
    await job.save();

    res.redirect(`/listings/${jobId}/applicants`);
  }
);

app.post(
  "/listings/:jobId/applicants/:workerId/reject",
  requireAuth,
  isBuilder,
  async (req, res) => {

    const { jobId, workerId } = req.params;
    const job = await Listing.findById(jobId);

    console.log("Job found for rejection:", job);

    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).end();
    }

    const application = job.applications.find(
      a => a.applicant.toString() === workerId
    );

    if (!application) {
      return res.status(404).end();
    }

    application.status = "Rejected";
    await job.save();

    res.redirect(`/listings/${jobId}/applicants`);
  }
);

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("./login");
});


mongoose.connect("mongodb://127.0.0.1:27017/workerhub")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})