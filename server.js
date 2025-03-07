const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const winston = require("winston");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./src/routes/authRoutes");
const coffeeRoutes = require("./src/routes/coffeeRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const userRoutes = require("./src/routes/userRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const syncDatabase = require("./src/config/syncDatabase");

dotenv.config();

const app = express();

const log = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console(),
  ],
});

app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);
app.use((req, res, next) => {
  log.info(`${req.method} ${req.url}`);
  next();
});

console.log("authRoutes:", typeof authRoutes);
console.log("coffeeRoutes:", typeof coffeeRoutes);
console.log("cartRoutes:", typeof cartRoutes);
console.log("favoriteRoutes:", typeof favoriteRoutes);
console.log("orderRoutes:", typeof orderRoutes);
console.log("userRoutes:", typeof userRoutes);
console.log("paymentRoutes:", typeof paymentRoutes);

let supabaseClient;

syncDatabase()
  .then((client) => {
    supabaseClient = client;

    app.use((req, res, next) => {
      req.supabase = supabaseClient;
      next();
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/coffees", coffeeRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/favorites", favoriteRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/payments", paymentRoutes);

    app.use(errorMiddleware);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    log.error(`Failed to start server due to database error: ${error.message}`);
    process.exit(1);
  });
