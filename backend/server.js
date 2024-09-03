require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const connectDb = require("./utils/db");
const authRoutes = require("./routes/authRoute");
const productRoutes = require("./routes/productRoute");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["*"],
  })
);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/product",productRoutes);

app.listen(PORT, () => {
  connectDb();
  console.log("Server started on port ... " + PORT);
});
