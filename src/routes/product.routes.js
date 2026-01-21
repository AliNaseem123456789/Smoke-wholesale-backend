const { Router } = require("express");
const {
  fetchProducts,
  fetchHomeProducts,
  fetchProductsByBrand,
  fetchProductsByCategory,
  fetchProductById,
  addProduct,
  testadmin,
} = require("../controllers/product.controller");
// const { verifyTokenFromCookie } = require("./../jwt");
// const requireAdmin = require("../middlware/requiredAdmin");
const router = Router();

router.get("/display", fetchProducts);
router.get("/brand/:brand", fetchProductsByBrand);
router.get("/category/:category", fetchProductsByCategory);
router.get("/product/:id", fetchProductById);
router.get("/home", fetchHomeProducts);
router.post("/addProducts", addProduct);
module.exports = router;
