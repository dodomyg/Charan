const PRODUCT = require("../schema/PRODUCT");
const USER = require("../schema/USER");
const ORDER = require('../schema/ORDER');

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await USER.countDocuments();
    const totalProducts = await PRODUCT.countDocuments();
    const totalOrders = await ORDER.countDocuments();
    
    
  } catch (error) {
    console.log("Error in getAnalytics", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = getAnalytics;
