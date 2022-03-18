const router = require("express").Router();
const { snap, paymentFee } = require("./payment.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/fee", checkToken, paymentFee);
router.post("/snap", checkToken, snap);
router.post("/status", checkToken, snap);

module.exports = router; 