import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bitpayRoutes from "./server/bitpay-routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

app.use("/api/bitpay", bitpayRoutes);

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
