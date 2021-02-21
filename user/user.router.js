const router = require("express").Router();
const { generateOtp, verifyOtp, setPin } = require("./user.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/generateOtp", generateOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/setPin", checkToken, setPin);

module.exports = router; 