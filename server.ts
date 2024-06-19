import { config } from "./src/config/config";
import app from "./src/app";

const startServer = () => {
  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`Listening on port number: ${port}`);
  });
};
startServer();
