import app from "./app";
import config from "./config/config.env";
import { connectDB } from "./config/database";

const port = config.PORT;

connectDB();
app.listen(port, () => {
  console.log(`Server running on PORT: ${port}... `);
});
