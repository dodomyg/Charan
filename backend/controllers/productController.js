const PRODUCT = require("../schema/PRODUCT");
const redisClient = require("../utils/redis");

const getAllProducts = async (req, res) => {
  try {
    const allProducts = await PRODUCT.find({});
    return res.status(200).json(allProducts);
  } catch (error) {
    console.log("Error while fetching all products", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getActiveProduct = async (req, res) => {
  try {
    let activeProducts = await redisClient.get("activeProducts");
    if (activeProducts) {
      const products = JSON.parse(activeProducts);
      return res.status(200).json(products);
    }
    activeProducts = await PRODUCT.find({ active: true }).lean();

    await redisClient.set("activeProducts", JSON.stringify(activeProducts));
  } catch (error) {
    console.log("Error while fetching all products", error);
    return res.status(500).send("Internal Server Error");
  }
};

const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    isActive,
    countInStock,
    category,
    rating,
    size,
  } = req.body;
  try {
    if (
      !name ||
      !description ||
      !price ||
      !countInStock ||
      !category ||
      !rating ||
      !size
    ) {
      return res.status(400).send("All fields are required");
    }

    const product = new PRODUCT({
      name,
      description,
      price,
      isActive,
      countInStock,
      category,
      rating,
      size,
    });
    await product.save();
    return res.status(200).json(
      {
        message: "Product created successfully",
      },
      product
    );
  } catch (error) {
    console.log("Error while creating product", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { getAllProducts, getActiveProduct, createProduct };
