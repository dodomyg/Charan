const express = require("express");
const {checkoutSession,checkOutSuccess} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/checkout",verifyToken,checkoutSession)
router.post("/checkout-success",verifyToken,checkOutSuccess)

module.exports = router;
