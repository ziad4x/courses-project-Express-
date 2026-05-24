import express from "express";
import categoryController from "./../controllers/category.controller";
import verifyToken from "../middlewares/verfiyToken";
import allowedTo from "../middlewares/allowedTo";
const router = express.Router();
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post(
  "/",
  verifyToken,
  allowedTo("admin"),
  categoryController.createCategory,
);
router.put(
  "/:id",
  verifyToken,
  allowedTo("admin"),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  verifyToken,
  allowedTo("admin"),
  categoryController.deleteCategory,
);
export default router;
