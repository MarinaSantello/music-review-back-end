import express from "express";
import { createLike, deleteLike } from "../controllers/curtida.js";

const router = express.Router();

router.post('/like', createLike);

router.delete('/deslike', deleteLike);

export default router;