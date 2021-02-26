const router = require("express").Router();
const { createOrder, getOrderBySellerId } = require("./order.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/create", checkToken, createOrder);
router.get("/seller", checkToken, getOrderBySellerId);

module.exports = router; 