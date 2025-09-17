import "dotenv/config";
// Server bootstrap
import app from "./app";
import { Express } from "express";
const PORT = process.env.PORT || 3000;
(app as Express).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
