// require("dotenv").config();
const jwt = require("jsonwebtoken");
const USER = require("../schema/USER");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    // console.log(token);

    if (!token) {
      return res.status(401).send("Access Denied");
    }
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) return res.status(401).send("Invalid Token");
    const loggedUser = await USER.findById(decoded.userId).select("-password");

    req.user = loggedUser;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send("Server Error");
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(401).send("Unauthorized, you are not an admin");
    }
  } catch (error) {
    console.log("admin middleware error", error);
    return res.status(401).send("Server Error");
  }
};

module.exports = { verifyToken, isAdmin };
