const router = require("express").Router();
const { createOrder, getOrderBySellerId, getOrderByBuyerId, getOrderByCode, shipOrder, uploadImage, finishOrder } = require("./order.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/create", checkToken, createOrder);
router.get("/seller", checkToken, getOrderBySellerId);
router.get("/buyer", checkToken, getOrderByBuyerId);
router.get("/code", checkToken, getOrderByCode);
router.post("/image", checkToken, uploadImage);
router.post("/shipping", checkToken, shipOrder);
router.post("/finish", checkToken, finishOrder);

module.exports = router; 