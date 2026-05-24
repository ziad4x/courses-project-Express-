import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import verifyToken from "../middlewares/verfiyToken";
import allowedTo from "../middlewares/allowedTo";
const router = express.Router();

router.get("/", verifyToken, allowedTo("admin"), getAllUsers);
router.get("/:id", verifyToken, allowedTo("admin"), getUserById);
router.post("/", verifyToken, allowedTo("admin"), createUser);
router.put("/:id", verifyToken, allowedTo("admin"), updateUser);
router.delete("/:id", verifyToken, allowedTo("admin"), deleteUser);

export default router;
