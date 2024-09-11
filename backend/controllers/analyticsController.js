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

const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await ORDER.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

const getDatesInRange = (startDate, endDate) => {
  try {
    const dateArray = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate).toISOString().slice(0, 10));
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
    return dateArray;
  } catch (error) {
    console.log("Error in getDatesInRange", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { getAnalytics, getDailySalesData };
