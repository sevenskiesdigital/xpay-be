const router = require("express").Router();
const { generateOtp, verifyOtp } = require("./user.controller");

router.post("/otp/generate", generateOtp);
router.post("/otp/verify", verifyOtp);

module.exports = router; 