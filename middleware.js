const jwt = require("jsonwebtoken");
const User=require("./models/userModel");

const setCurrentUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user || null;
    req.userId = decoded.userId;

  } catch (err) {
    req.user = null;
  }

  next();
};  

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

const isBuilder = async(req, res, next) => {
    if (!req.user || req.user.role !== "BUILDER") {
        return res.status(403).send("Access denied. Builders only.");
    }
    next();
};



module.exports = {setCurrentUser,requireAuth,isBuilder};

