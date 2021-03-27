const router = require("express").Router();
const { payoutBySellerId } = require("./payout.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/seller", checkToken, payoutBySellerId);

module.exports = router; 