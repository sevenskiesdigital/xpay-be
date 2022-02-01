const router = require("express").Router();
const { generateOtp, verifyOtp, setPin, verifyPin } = require("./user.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/generateOtp", generateOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/setPin", checkToken, setPin);
router.post("/verifyPin", verifyPin);

module.exports = router; 