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


router.get("/",requireAuth,async (req,res)=>{
      const allListings = await Listing.find();
      res.render("./listings/index" ,{allListings});
  });


  router.get("/addListing",requireAuth,isBuilder,async (req,res)=>{
      const user = await User.findById(req.userId);
      res.render("./listings/addListing.ejs", { user, error: null });
  });

  router.post("/addListing",requireAuth,isBuilder,upload.single("job[image]"),async (req, res) => {
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
    "wagePerDay",
    "paymentType"
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

      if (jobData.customFields) {
    jobData.customFields = jobData.customFields.filter(
      field => field.label && field.value
    );
  }
      

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

  router.get("/:id",requireAuth,async (req, res) => {
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

  router.get("/:id/edit", requireAuth, async (req, res) => {
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

  router.put("/:id", requireAuth, async (req, res) => {
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

  router.delete("/:id", requireAuth, async (req, res) => {
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

  router.post("/:id/apply", requireAuth, async (req, res) => {
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

    res.render("listings/show", {
        listing,
        currUser: req.user,
        success: "Successfully applied for this job!",
        error: null
      }); 


    } catch (err) {
      console.error(err);
        res.render("listings/show", {
        listing: null,
        currUser: req.user,
        error: "Something went wrong",
        success: null
      });
    }
  });


module.exports = router;