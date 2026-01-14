const jwt = require("jsonwebtoken");
const User = require("./models/userModel");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("No token found");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const user = await User.findById(decoded.userId);

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user; 
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log(err);
    return res.redirect("/login");
  }
};

module.exports = requireAuth;
