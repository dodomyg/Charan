const express = require("express");
const {
  getAllProducts,
  getActiveProduct,
  createProduct,
  deleteProduct,
  recommededProducts,
  getProductsByCategory,
  isActiveProduct
} = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllProducts);

router.get("/active", getActiveProduct);

router.post("/create",verifyToken,isAdmin,createProduct);
router.post("/:id",verifyToken,isAdmin,deleteProduct);
router.get('/reccomended',verifyToken,recommededProducts)

router.get("/cat/:category", getProductsByCategory);

router.patch("/:id", verifyToken, isAdmin, isActiveProduct);

module.exports = router;
