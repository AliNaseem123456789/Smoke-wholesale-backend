// routes/product.routes.js
const { Router } = require('express');
const {
  fetchProducts,
  fetchHomeProducts,
  fetchProductsByBrand,
  fetchProductsByCategory,
  fetchProductById
} = require('../controllers/product.controller');

const router = Router();

router.get('/display', fetchProducts);
router.get('/brand/:brand', fetchProductsByBrand);
router.get('/category/:category', fetchProductsByCategory);
router.get('/product/:id', fetchProductById);
router.get('/home', fetchHomeProducts);

module.exports = router;
