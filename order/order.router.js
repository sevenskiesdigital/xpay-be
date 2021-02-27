const router = require("express").Router();
const { createOrder, getOrderBySellerId, getOrderByCode } = require("./order.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/create", checkToken, createOrder);
router.get("/seller", checkToken, getOrderBySellerId);
router.get("/buyer", getOrderByCode);

module.exports = router; 