const cors = require("cors");
const { env } = require("./env");
const dotenv = require("dotenv");
dotenv.config();

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});

// Correct export:
module.exports = corsMiddleware;

// (Not this)
// module.exports = { corsMiddleware };
