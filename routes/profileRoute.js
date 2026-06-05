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

  async function getJobsByStatus(userId, status) {

  let jobs = await Listing.find({
    applications: {
      $elemMatch: {
        applicant: userId,
        status: status
      }
    }
  }).lean();

  jobs.forEach(job => {
    job.myApplication = job.applications.find(app =>
      app.applicant.toString() === userId.toString() &&
      app.status === status
    );
  });

  return jobs;
}

  router.get("/", requireAuth, async (req, res) => {
      const user = req.user;
      let jobs = [];
      let completedJobs = [];
    let appliedJobs = [];
    let acceptedJobs = [];

    if (user.role === "BUILDER") {
      jobs = await Listing.find({ postedBy: user._id });
    } 
    else if (user.role === "WORKER") {

  jobs = await Listing.find({
    "applications.applicant": user._id
  }).populate("applications.applicant");


  // Completed Jobs
   completedJobs = await Listing.find({
    applications: {
      $elemMatch: {
        applicant: user._id,
        status: "Completed"
      }
    }
  }).lean();

  completedJobs.forEach(job => {
    job.myApplication = job.applications.find(app =>
      app.applicant.toString() === user._id.toString() &&
      app.status === "Completed"
    );
  });


  // Applied Jobs
  let appliedJobs = await Listing.find({
    applications: {
      $elemMatch: {
        applicant: user._id,
        status: "Applied"
      }
    }
  }).lean();

  appliedJobs.forEach(job => {
    job.myApplication = job.applications.find(app =>
      app.applicant.toString() === user._id.toString() &&
      app.status === "Applied"
    );
  });

  // Active Jobs
   acceptedJobs = await getJobsByStatus(user._id, "Accepted");




  
}


res.render("./listings/profile", {
    user,
    jobs,
    isOwner: true,
    completedJobs,
    appliedJobs,
    acceptedJobs
  });
  });

  router.get("/edit", requireAuth, async (req, res) => {
      const user = await User.findById(req.user._id);
      res.render("./listings/editProfile", { user });
  });

  router.get("/:id", async (req, res) => {
    try {
      const worker = await User.findById(req.params.id);

      if (!worker) {
        return res.status(404).send("User not found");
      }

      if (worker.role !== "WORKER") {
        return res.status(403).send("This profile is private");
      }
      console.log("Worker ID:", worker._id);

      const allJobs = await Listing.find({
        "applications.applicant": worker._id
      });

  console.log("All jobs applied:", allJobs.length);

      const completedJobs = await Listing.find({
    applications: {
      $elemMatch: {
        applicant: worker._id,
        status: "Completed"
      }
    }
  }).lean();


      console.log("Completed jobs:", completedJobs);

      const isOwner =
        req.user && req.user._id.equals(worker._id);

      res.render("./listings/profile", {
        user: worker,
        jobs: [],              
        completed: completedJobs,
        isOwner
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  router.post("/edit", requireAuth, upload.single("profilePhoto"), async (req, res) => {
      try {
          const { username, bio } = req.body;

          

          const updatedData = {
              username,
              bio
          };

          if (req.file) {
              updatedData.profilePhoto = {
                  url: req.file.path,
                  filename: req.file.filename
              };
          }

          await User.findByIdAndUpdate(req.user._id, updatedData);

          res.redirect("/profile");

      } catch (err) {
          console.error(err);
          res.status(500).send("Error updating profile");
      }
  });

  router.post("/bio", requireAuth, async (req, res) => {
      try {
          const { bio } = req.body;

          await User.findByIdAndUpdate(
              req.user._id,
              { bio: bio },
              { new: true }
          );

          res.redirect("/profile");

      } catch (err) {
          console.error(err);
          res.status(500).send("Error updating bio");
      }
  });

  module.exports = router;