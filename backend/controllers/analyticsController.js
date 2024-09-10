const PRODUCT = require("../schema/PRODUCT");
const USER = require("../schema/USER");
const ORDER = require("../schema/ORDER");

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await USER.countDocuments();
    const totalProducts = await PRODUCT.countDocuments();
    const totalOrders = await ORDER.countDocuments();

    const salesData = await ORDER.aggregate([
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalAmount",
          },
          totalSales: {
            $sum: 1,
          },
        },
      },
    ]);
    const { revenue, totalSales } = salesData[0] || {
      revenue: 0,
      totalSales: 0,
    };
    return res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      totalSales,
    });
  } catch (error) {
    console.log("Error in getAnalytics", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = getAnalytics;
