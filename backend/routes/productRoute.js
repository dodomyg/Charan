const express = require("express");
const {
  getAllProducts,
  getActiveProduct,
  createProduct
} = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllProducts);

router.get("/active", getActiveProduct);

router.post("/create",verifyToken,isAdmin,createProduct);

module.exports = router;
