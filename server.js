require('dotenv').config()
const cors = require('cors')
const express = require('express')

const authRouter = require('./routes/auth.routes')

function starter() {
  try {
    const app = express();
    const PORT = process.env.PORT;

    app.use(cors({
      origin: 'https://hrms-neon-xi.vercel.app',
      credentials: true,
    }));
    app.use(express.json());
    app.use("/api/auth", authRouter);

    app.listen(PORT, console.log(`server is running on ${PORT} port!`));
  } catch (error) {
    console.log(error);
  }
}

starter();
