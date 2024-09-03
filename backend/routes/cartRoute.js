const express = require("express");
const {addtoCart,getCart,removeCart,updateQuantity} = require("../controllers/cartController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();


router.post('/',verifyToken,addtoCart)
router.get('/',verifyToken,getCart)
router.post('/remove',verifyToken,removeCart)
router.post('/:productId',verifyToken,updateQuantity)


module.exports = router;
