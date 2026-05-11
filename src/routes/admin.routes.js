const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { verifyTokenFromCookie } = require("../jwt");

const requireAdmin = require("../middlware/requiredAdmin.js");
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateProduct,
  createProduct,
  getProducts,
  deleteProduct,
  uploadImage,
  updateFeatureSection,
  getSiteSettings,
} = require("../controllers/admin.controller");
router.get("/users", verifyTokenFromCookie, requireAdmin, getAllUsers);
router.patch(
  "/users/:id/role",
  verifyTokenFromCookie,
  requireAdmin,
  updateUserRole,
);
router.delete("/users/:id", verifyTokenFromCookie, requireAdmin, deleteUser);
router.get("/products", verifyTokenFromCookie, requireAdmin, getProducts);
router.post("/products", verifyTokenFromCookie, requireAdmin, createProduct);
router.patch(
  "/products/:id",
  verifyTokenFromCookie,
  requireAdmin,
  updateProduct,
);
router.delete(
  "/products/:id",
  verifyTokenFromCookie,
  requireAdmin,
  deleteProduct,
);

router.post(
  "/upload",
  verifyTokenFromCookie,
  requireAdmin,
  upload.single("image"),
  uploadImage,
);
router.get("/settings", getSiteSettings);

router.patch(
  "/update-feature",
  verifyTokenFromCookie,
  requireAdmin,
  upload.single("image"),
  updateFeatureSection,
);
module.exports = router;
