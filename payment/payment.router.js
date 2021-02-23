const router = require("express").Router();
const { snap } = require("./payment.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/snap", checkToken, snap);

module.exports = router; 