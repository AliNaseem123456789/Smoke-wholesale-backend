const express = require("express");
const router = express.Router();
const {
  checkout,
  getUserOrders,
  fetchPaymentHistory,
} = require("../controllers/orders.controller");
const { verifyTokenFromCookie } = require("../jwt");

router.post("/checkout", verifyTokenFromCookie, checkout);
router.get("/my-orders", verifyTokenFromCookie, getUserOrders);
router.get("/payment-history", verifyTokenFromCookie, fetchPaymentHistory);
module.exports = router;
