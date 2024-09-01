const express = require("express");
const { register,logout, login, refreshAccessToken, getProfile } = require("../controllers/authConroller");
const {verifyToken} = require("../middleware/verifyToken");

const router = express.Router();

router.post("/register", register);
router.post("/login",login);
router.post("/logout",logout);
router.post("/refresh",refreshAccessToken);
router.get("/jwt",verifyToken,getProfile);

module.exports = router;
