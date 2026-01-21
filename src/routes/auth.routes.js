const { Router } = require("express");
const {
  login,
  register,
  me,
  logout,
} = require("../controllers/auth.controller");
const { generateAccessToken, verifyTokenFromCookie } = require("../jwt");
const router = Router();
router.post("/login", login);
router.post("/register", register);
router.get("/me", verifyTokenFromCookie, me);
router.post("/logout", logout);

module.exports = router;
