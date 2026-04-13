const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Error:", err));

// start server
app.listen(5000, () => console.log("Server running on port 5000"));