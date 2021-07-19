const router = require("express").Router();
const { payoutBySellerId, payoutByOrderId } = require("./payout.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/seller", checkToken, payoutBySellerId);
router.post("/buyer", checkToken, payoutByOrderId);

module.exports = router; 