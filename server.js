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
  const authRoutes = require("./routes/authRoutes");
  const listingsRoute=require("./routes/listingsRoute");
  const profileRoute=require("./routes/profileRoute");

  app.use(methodOverride('_method'));
  app.use(express.static("public"));
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

  app.use("/", authRoutes);
  app.use("/listings",listingsRoute);
  app.use("/profile",profileRoute);
 

  mongoose.connect("mongodb://127.0.0.1:27017/workerhub")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));


  app.listen(3000,()=>{
      console.log("Server is running on port 3000");
  })