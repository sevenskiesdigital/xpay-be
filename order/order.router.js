const router = require("express").Router();
const { createOrder, getOrderBySellerId, getOrderByCode, shipOrder, uploadImage } = require("./order.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/create", checkToken, createOrder);
router.get("/seller", checkToken, getOrderBySellerId);
router.get("/buyer", getOrderByCode);
router.post("/image", checkToken, uploadImage);
router.post("/shipping", checkToken, shipOrder);

module.exports = router; 