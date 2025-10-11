/**
 * service-example - Service entry point
 */

import dotenv from "dotenv";
import { server } from "./server.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
