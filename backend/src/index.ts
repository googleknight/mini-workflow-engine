import dotenv from "dotenv";
dotenv.config();

import app from "./app";

import logger from "./lib/logger";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running on port ${PORT}`);
});
