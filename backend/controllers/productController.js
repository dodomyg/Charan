const PRODUCT = require("../schema/PRODUCT");
const redisClient = require("../utils/redis");
const cloudinary = require("../utils/cloudinary");
const { default: mongoose } = require("mongoose");

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
    return res.status(200).json(activeProducts);
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
    image,
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
      !image ||
      !countInStock ||
      !category ||
      !rating ||
      !size
    ) {
      return res.status(400).send("All fields are required");
    }
    let imageResp = null;

    if (image) {
      imageResp = await cloudinary.uploader.upload(
        image,
        { folder: "products" },
        (err, result) => {
          if (err) {
            return res.status(400).send("Image upload failed");
          }
        }
      );
    }
    const product = await PRODUCT.create({
      name,
      description,
      price,
      image: imageResp?.secure_url ? imageResp?.secure_url : image.filepath,
      countInStock,
      category,
      rating,
      size,
    });
    return res
      .status(200)
      .json({ message: "Product created successfully", product });
  } catch (error) {
    console.log("Error while creating product", error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const product = await PRODUCT.findById(id);
    if (product.image) {
      //del img from cloudinary
      const imageId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${imageId}`);
    }
    await PRODUCT.findByIdAndDelete(id);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error while deleting product", error);
    return res.status(500).send("Internal Server Error");
  }
};

const recommededProducts = async (req, res) => {
  try {
    const fetchProducts = await PRODUCT.aggregate([
      //aggregate pipelines
      { $sample: { size: 4 } },
      {
        $project: {
          name: 1,
          price: 1,
          image: 1,
          _id: 1,
          category: 1,
          description: 1,
        },
      },
    ]);
    return res.status(200).json(fetchProducts);
  } catch (error) {
    console.log("Error while recommededProducts", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if(!category){
      return res.status(400).send("Category is required");
    }
    const products = await PRODUCT.find({category});
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error while getProductsByCategory", error);
    return res.status(500).send("Internal Server Error");
  }
};

const isActiveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const product = await PRODUCT.findById(id);
    if(product){
      product.isActive = !product.isActive;
    }
    const activeProductsCache = await PRODUCT.find({isActive: true}).lean();
    await redisClient.set("activeProducts", JSON.stringify(activeProductsCache));
    await product.save();
    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.log("Error while toggling active", error);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getAllProducts,
  getActiveProduct,
  createProduct,
  deleteProduct,
  getProductsByCategory,
  recommededProducts,
  isActiveProduct
};
