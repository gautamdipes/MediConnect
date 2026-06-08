console.log("1. SERVER FILE LOADED");

import dotenv from "dotenv";
dotenv.config();

console.log("2. DOTENV LOADED");

import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("3. SERVER LISTENING ON PORT:", PORT);
});