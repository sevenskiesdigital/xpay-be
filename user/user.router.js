const router = require("express").Router();
const { generateOtp, verifyOtp, setPin, verifyPin, verifyFace, setFace } = require("./user.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/generateOtp", generateOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/setPin", checkToken, setPin);
router.post("/verifyPin", checkToken, verifyPin);
router.post("/setFace", checkToken, setFace);
router.post("/verifyFace", checkToken, verifyFace);

module.exports = router; 