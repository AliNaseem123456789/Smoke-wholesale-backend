import { Router } from 'express';
import { fetchProducts, fetchHomeProducts, fetchProductsByBrand, fetchProductsByCategory, fetchProductById } from '../controllers/product.controller';
const router = Router();

router.get('/display', fetchProducts);
router.get('/brand/:brand', fetchProductsByBrand);
router.get('/category/:category', fetchProductsByCategory);
// routes/products.ts
router.get("/product/:id", fetchProductById);
router.get("/home", fetchHomeProducts);
export default router;

