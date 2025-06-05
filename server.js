require("dotenv").config();
const cors = require("cors");
const express = require("express");

const authRouter = require("./routes/auth.routes");

const app = express();

app.use(
  cors({
    origin: "https://hrms-neon-xi.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRouter);

module.exports = app;
