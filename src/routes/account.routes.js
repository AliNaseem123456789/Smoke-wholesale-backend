const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getMySubAccounts,
  updateSubAccountPermission,
  addSubAccount,
  getMyCreditHistory,
} = require("../controllers/account.controller");
const { verifyTokenFromCookie } = require("../jwt");

router.patch("/update-profile", verifyTokenFromCookie, updateProfile);

router.post("/add-subaccount", verifyTokenFromCookie, addSubAccount);
router.get("/my-sub-accounts", verifyTokenFromCookie, getMySubAccounts);
router.patch(
  "/update-subaccount-permission",
  verifyTokenFromCookie,
  updateSubAccountPermission,
);
router.get("/my-history", verifyTokenFromCookie, getMyCreditHistory);
module.exports = router;
