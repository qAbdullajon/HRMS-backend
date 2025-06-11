require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const employeeRouter = require("./routes/employee.routes");

function starter() {
  try {
    const app = express();
    const PORT = process.env.PORT || 5000;

    app.use(
      cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
      })
    );

    app.use(express.json());
    app.use(cookieParser());

    app.use("/files", express.static("public/files"));

    // Routerlar
    app.use("/api/auth", authRouter);
    app.use("/api/employee", employeeRouter);

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Serverda xatolik:", error);
  }
}

starter();
