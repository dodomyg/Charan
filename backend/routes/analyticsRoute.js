const express  =require("express");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");
const getAnalytics = require("../controllers/analyticsController");

const router = express.Router();

router.get("/get",verifyToken,isAdmin,getAnalytics)


module.exports = router