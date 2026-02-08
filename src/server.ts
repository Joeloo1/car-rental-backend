import app from "./app";
import config from "./config/config.env";
import { connectDB } from "./config/database";
import logger from "./config/winston";

const port = config.PORT;

connectDB();
app.listen(port, () => {
  logger.info(`Server running on PORT: ${port}...`);
  console.log(`Server running on PORT: ${port}... `);
});
