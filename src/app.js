const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const { verifyTokenFromCookie } = require("./jwt");

const prisma = new PrismaClient();
module.exports = prisma;

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const testRoutes = require("./routes/test.routes");
const cartRoutes = require("./routes/cart.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/orders.routes");
const accountRoutes = require("./routes/account.routes");
const adminRoutes = require("./routes/admin.routes");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const logRequest = (req, res, next) => {
  console.log(
    `${new Date().toLocaleString()} Request made to: ${req.originalUrl}`
  );
  next();
};

app.use(logRequest);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/test", testRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend is running",
    user: req.user,
  });
});

module.exports = app;
