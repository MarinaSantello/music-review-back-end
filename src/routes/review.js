import express from "express";
import { searchMusics } from "../controllers/review.js";

const router = express.Router();

router.post('/search', searchMusics);

export default router;