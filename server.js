import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/mongodb.js";
import productRoutes from "./routes/productRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/products", productRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
  });
});