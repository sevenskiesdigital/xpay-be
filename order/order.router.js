const router = require("express").Router();
const { createOrder, getOrderBySellerId, getOrderByBuyerId, getOrderByCode, shipOrder, uploadImage, finishOrder, statusOrder } = require("./order.controller");
const { checkToken } = require("../auth/token_validation");

router.post("/create", checkToken, createOrder);
router.get("/seller", checkToken, getOrderBySellerId);
router.get("/buyer", checkToken, getOrderByBuyerId);
router.get("/code", checkToken, getOrderByCode);
router.post("/image", checkToken, uploadImage);
router.post("/shipping", checkToken, shipOrder);
router.post("/finish", checkToken, finishOrder);
router.post("/status", statusOrder);

module.exports = router; 