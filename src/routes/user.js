import express from "express";
import { createUser, updateUser, deleteUser, login } from "../controllers/user.js";

const router = express.Router();

router.post('/create', createUser);
router.put('/update', updateUser);
router.delete('/delete/:id', deleteUser);

router.post('/login', login);

export default router;