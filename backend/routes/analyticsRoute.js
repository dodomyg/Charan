const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");
const {getAnalytics,getDailySalesData} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/get", verifyToken, isAdmin, async (req, res) => {
  try {
    const analyticsData = await getAnalytics();
    const endDate = await new Date();
    const startDate = await new Date(endDate.getDays() - 6);
    const getDailySalesData = await getDailySalesData(startDate, endDate);
    res.status(200).json({
      analyticsData,
      getDailySalesData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
