const { Router } = require("express");
const {
  fetchCartProducts,
  addToCart,
  updateQuantity,
  removeFromCart,
  saveCartTemplate,
  fetchSavedTemplates,
  fetchSavedTemplateDetails,
} = require("../controllers/cart.controller");
const router = Router();

const { verifyTokenFromCookie } = require("../jwt");
router.use(verifyTokenFromCookie);
router.get("/", fetchCartProducts);
router.post("/add", addToCart);
router.patch("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);
router.post("/save-cart-template", saveCartTemplate);
router.get("/saved-cart-templates", fetchSavedTemplates);
router.get("/saved-cart-templates-details/:id", fetchSavedTemplateDetails);
module.exports = router;
