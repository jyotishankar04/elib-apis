import { config } from "./src/config/config";
import app from "./src/app";
import connectDB from "./src/config/db";

const startServer = async () => {
  await connectDB();
  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`Listening on port number: ${port}`);
  });
};
startServer();